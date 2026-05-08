import type { ValidationResult, CustomValidator, Path, PathValue } from './types';
import { setImmutable } from './utils';

type TransformerFn = (val: any) => any;

export abstract class AbstractStatelessDataModel<T extends Record<string, any>> {
  protected _customValidators: CustomValidator<T>[] = [];
  protected _transformers = new Map<string, TransformerFn[]>();

  protected abstract performLibraryValidation(data: unknown): ValidationResult;

  // --- Registration Methods ---

  public addCustomValidator(v: CustomValidator<T>) {
    this._customValidators.push(v);
  }

  public addTransformer<P extends Path<T>>(
    path: P,
    transformer: (val: PathValue<T, P> | undefined) => PathValue<T, P>
  ) {
    const pathStr = path as string;
    if (!this._transformers.has(pathStr)) this._transformers.set(pathStr, []);
    this._transformers.get(pathStr)!.push(transformer as TransformerFn);
  }

  // --- Core Stateless Pipeline ---

  /**
   * Takes raw HTTP/GraphQL input, transforms it, validates it, and returns both.
   */
  public async validate(rawData: unknown): Promise<{ result: ValidationResult; data: Partial<T> }> {
    // 1. Apply Transformers to the entire payload first
    const transformedData = this._applyAllTransformers(rawData as Partial<T>);

    // 2. Run Synchronous Schema Validation (Ajv/Zod)
    const libResult = this.performLibraryValidation(transformedData);
    let allErrors = [...libResult.errors];

    // 3. Run Async Custom Validators Concurrently
    if (this._customValidators.length > 0) {
      const customResults = await Promise.all(
        this._customValidators.map(v => v(transformedData as T))
      );

      for (const err of customResults) {
        if (err) allErrors.push(err);
      }
    }

    return {
      result: { isValid: allErrors.length === 0, errors: allErrors },
      data: transformedData
    };
  }

  // --- Internal Helpers ---

  protected _extractValue(tree: any, path: string): any {
    if (!tree) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], tree);
  }

  /**
   * Stateless Transformer Execution:
   * Iterates through all registered transformers and applies them to the raw payload.
   */
  private _applyAllTransformers(data: Partial<T>): Partial<T> {
    let updatedTree = data;

    this._transformers.forEach((fns, targetPath) => {
      const currentVal = this._extractValue(updatedTree, targetPath);
      let newVal = currentVal;

      for (const fn of fns) {
        newVal = fn(newVal);
      }

      // Only apply immutable update if the transformer ACTUALLY mutated the value
      if (newVal !== currentVal) {
        updatedTree = setImmutable(updatedTree, targetPath, newVal);
      }
    });

    return updatedTree;
  }
}
