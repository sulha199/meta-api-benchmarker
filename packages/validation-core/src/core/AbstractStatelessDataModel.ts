import type {
  ValidationResult,
  CustomValidator,
  Path,
  PathValue,
  ValueTransformer,
} from "./types";
import { setImmutable } from "./utils";

export abstract class AbstractStatelessDataModel<
  T extends Record<string, any>,
> {
  protected _customValidators: CustomValidator<T>[] = [];
  protected _beforeValidateTransformers = new Map<
    string,
    ((value: any) => Promise<any>)[]
  >();
  protected _afterValidateTransformers = new Map<
    string,
    ((value: any, vr: ValidationResult, bvr: any) => Promise<any>)[]
  >();

  protected abstract performLibraryValidation(data: unknown): ValidationResult;

  // --- Registration Methods ---

  public addCustomValidator(v: CustomValidator<T>) {
    this._customValidators.push(v);
  }

  public addValueTransformer<P extends Path<T>>(
    path: P,
    transformer: ValueTransformer<PathValue<T, P>>,
  ) {
    const pathStr = path as string;
    if (transformer.trigger === "beforeValidate") {
      if (!this._beforeValidateTransformers.has(pathStr)) {
        this._beforeValidateTransformers.set(pathStr, []);
      }
      this._beforeValidateTransformers
        .get(pathStr)!
        .push(transformer.handler as any);
    } else {
      // afterValidate
      if (!this._afterValidateTransformers.has(pathStr)) {
        this._afterValidateTransformers.set(pathStr, []);
      }
      this._afterValidateTransformers
        .get(pathStr)!
        .push(transformer.handler as any);
    }
  }

  // --- Core Stateless Pipeline ---

  /**
   * Takes raw HTTP/GraphQL input, transforms it, validates it, and returns both.
   */
  public async validate(rawData: unknown): Promise<{
    result: ValidationResult;
    data: Partial<T>;
    modifiedPaths: string[];
  }> {
    const valueBeforeTransformers = rawData as Partial<T>;
    const modifiedPaths = new Set<string>();

    // 1. Apply 'before' transformers
    const { tree: dataAfterBefore, modifiedPaths: beforePaths } =
      await this._applyAllBeforeValidateTransformers(valueBeforeTransformers);

    beforePaths.forEach((p) => modifiedPaths.add(p));

    // 2. Run Synchronous Schema Validation (Ajv/Zod)
    const libResult = this.performLibraryValidation(dataAfterBefore);
    let allErrors = [...libResult.errors];

    // 3. Run Async Custom Validators Concurrently
    if (this._customValidators.length > 0) {
      const customResults = await Promise.all(
        this._customValidators.map((v) => v(dataAfterBefore as T)),
      );

      for (const err of customResults) {
        if (err) allErrors.push(err);
      }
    }

    const validationResult = {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };

    // 4. Apply 'after' transformers
    const { tree: finalData, modifiedPaths: afterPaths } =
      await this._applyAllAfterValidateTransformers(
        dataAfterBefore,
        validationResult,
        valueBeforeTransformers,
      );

    afterPaths.forEach((p) => modifiedPaths.add(p));

    // 5. Final Path Sanity Check
    // We double-check the 'modifiedPaths' set to ensure that paths that were
    // temporarily modified but then restored (e.g. on validation failure) are removed.
    // This also handles edge cases where a transformer might return a new reference
    // for an identical value, which shouldn't count as a "modification" for the caller.
    const finalModifiedPaths = Array.from(modifiedPaths).filter((p) => {
      const originalValue = this._extractValue(valueBeforeTransformers, p);
      const finalValue = this._extractValue(finalData, p);
      return originalValue !== finalValue;
    });

    return {
      result: validationResult,
      data: finalData,
      modifiedPaths: finalModifiedPaths,
    };
  }

  // --- Internal Helpers ---

  protected _extractValue(tree: any, path: string): any {
    if (!tree) return undefined;
    return path.split(".").reduce((acc, part) => acc && acc[part], tree);
  }

  private async _applyAllBeforeValidateTransformers(
    data: Partial<T>,
  ): Promise<{ tree: Partial<T>; modifiedPaths: string[] }> {
    let updatedTree = data;
    const modifiedPaths: string[] = [];

    for (const [
      targetPath,
      fns,
    ] of this._beforeValidateTransformers.entries()) {
      const currentVal = this._extractValue(updatedTree, targetPath);
      let newVal = currentVal;
      for (const fn of fns) {
        newVal = await fn(newVal);
      }
      if (newVal !== currentVal) {
        updatedTree = setImmutable(updatedTree, targetPath, newVal);
        modifiedPaths.push(targetPath);
      }
    }
    return { tree: updatedTree, modifiedPaths };
  }

  private async _applyAllAfterValidateTransformers(
    data: Partial<T>,
    vr: ValidationResult,
    valueBeforeTransformers: Partial<T>,
  ): Promise<{ tree: Partial<T>; modifiedPaths: string[] }> {
    let updatedTree = data;
    const modifiedPaths: string[] = [];

    for (const [targetPath, fns] of this._afterValidateTransformers.entries()) {
      const currentVal = this._extractValue(updatedTree, targetPath);
      const originalVal = this._extractValue(
        valueBeforeTransformers,
        targetPath,
      );
      let newVal = currentVal;
      for (const fn of fns) {
        newVal = await fn(newVal, vr, originalVal);
      }
      if (newVal !== currentVal) {
        updatedTree = setImmutable(updatedTree, targetPath, newVal);
        modifiedPaths.push(targetPath);
      }
    }
    return { tree: updatedTree, modifiedPaths };
  }
}
