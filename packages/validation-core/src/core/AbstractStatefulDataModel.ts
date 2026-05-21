import { AbstractStatelessDataModel } from "./AbstractStatelessDataModel";
import { setImmutable } from "./utils";
import type { Path, PathValue, ValidationResult, ArrayElement } from "./types";

type DataChangeListenerFn = (newVal: any, oldVal: any) => void;
type ValidationChangeListenerFn = (result: ValidationResult) => void;

export abstract class AbstractStatefulDataModel<
  T extends Record<string, any>,
> extends AbstractStatelessDataModel<T> {
  protected _value: Partial<T> = {};
  protected _lastValidationResult: ValidationResult = {
    isValid: true,
    errors: [],
  };

  protected _dataChangeListeners = new Map<string, DataChangeListenerFn[]>();
  protected _validationChangeListeners: ValidationChangeListenerFn[] = [];

  constructor(initialValue?: Partial<T>) {
    super();
    if (initialValue) {
      this._value = initialValue;
    }
  }

  get value(): Partial<T> {
    return this._value;
  }

  public getValueAt<P extends Path<T>>(path: P): PathValue<T, P> | undefined {
    return this._extractValue(this._value, path as string);
  }

  // --- Event Subscription Methods ---

  public onDataChange<P extends Path<T>>(
    path: P,
    callback: (
      newVal: PathValue<T, P> | undefined,
      oldVal: PathValue<T, P> | undefined,
    ) => void,
  ) {
    const pathStr = path as string;
    if (!this._dataChangeListeners.has(pathStr))
      this._dataChangeListeners.set(pathStr, []);
    this._dataChangeListeners
      .get(pathStr)!
      .push(callback as DataChangeListenerFn);
  }

  public onValidationChange(callback: ValidationChangeListenerFn) {
    this._validationChangeListeners.push(callback);
  }

  // --- Core Mutation Method ---

  public async setValueAt<P extends Path<T>>(
    path: P,
    value: PathValue<T, P>,
  ): Promise<{ result: ValidationResult; modifiedPaths: string[] }> {
    const pathStr = path as string;

    // Early return if the value hasn't actually changed
    if (this.getValueAt(path) === value) {
      return { result: this._lastValidationResult, modifiedPaths: [] };
    }

    const oldTreeBeforeAll = this._value;
    const nextTree = setImmutable(this._value, pathStr, value);

    this._value = nextTree;

    // Fire Data Event (Sync), then await validation which includes transformers
    this._fireDataChangeListeners(oldTreeBeforeAll, nextTree, [pathStr]);

    const { result, modifiedPaths: transformerPaths } =
      await this.validateCurrentState();

    // Calculate global NET modified paths relative to the very start of the operation.
    // This captures the manual change AND all subsequent transformer effects.
    const allTouchedPaths = new Set<string>([pathStr, ...transformerPaths]);
    const netModifiedPaths = Array.from(allTouchedPaths).filter((p) => {
      return (
        this._extractValue(oldTreeBeforeAll, p) !==
        this._extractValue(this._value, p)
      );
    });

    return { result, modifiedPaths: netModifiedPaths };
  }

  // --- Array Operations ---

  public async pushValueAt<P extends Path<T>>(
    path: P,
    item: PathValue<T, P> extends readonly unknown[]
      ? ArrayElement<PathValue<T, P>>
      : never,
  ): Promise<{ result: ValidationResult; modifiedPaths: string[] }> {
    const arr = (this.getValueAt(path) || []) as any[];
    return await this.setValueAt(path, [...arr, item] as any);
  }

  public async removeValueAt<P extends Path<T>>(
    path: P,
    index: number,
  ): Promise<{ result: ValidationResult; modifiedPaths: string[] }> {
    const arr = (this.getValueAt(path) || []) as any[];
    return await this.setValueAt(
      path,
      arr.filter((_, i) => i !== index) as any,
    );
  }

  // --- Stateful Validation Pipeline ---

  /**
   * Triggers the parent stateless validation pipeline using the current internal state.
   */
  public async validateCurrentState(): Promise<{
    result: ValidationResult;
    modifiedPaths: string[];
  }> {
    // Call the lightning-fast parent method, which also applies global transformers
    const {
      result: newResult,
      data: transformedData,
      modifiedPaths,
    } = await super.validate(this._value);

    // If super.validate applied global transformers that mutated the tree, update state!
    if (this._value !== transformedData) {
      const oldTree = this._value;
      this._value = transformedData;
      this._fireDataChangeListeners(oldTree, transformedData, modifiedPaths);
    }

    const isValidationChanged =
      this._lastValidationResult.isValid !== newResult.isValid ||
      this._lastValidationResult.errors.length !== newResult.errors.length;

    this._lastValidationResult = newResult;

    // Fire Validation Event
    if (isValidationChanged) {
      this._validationChangeListeners.forEach((cb) =>
        cb(this._lastValidationResult),
      );
    }

    return {
      result: this._lastValidationResult,
      modifiedPaths,
    };
  }

  public getErrorsAt<P extends Path<T>>(path: P): string[] {
    return this._lastValidationResult.errors
      .filter((e) => e.path === path || e.path.startsWith(`${path as string}.`))
      .map((e) => e.message);
  }

  // --- Internal Helpers ---

  private _fireDataChangeListeners(
    oldTree: Partial<T>,
    newTree: Partial<T>,
    modifiedPaths?: string[],
  ) {
    this._dataChangeListeners.forEach((callbacks, listenPath) => {
      // Optimization: If modifiedPaths is provided, skip listeners that couldn't have changed.
      // A listener is affected if its path is a parent, child, or equal to a modified path.
      if (modifiedPaths) {
        const isAffected = modifiedPaths.some(
          (mp) =>
            listenPath === mp ||
            mp.startsWith(listenPath + ".") ||
            listenPath.startsWith(mp + "."),
        );
        if (!isAffected) return;
      }

      const oldVal = this._extractValue(oldTree, listenPath);
      const newVal = this._extractValue(newTree, listenPath);

      if (oldVal !== newVal) {
        callbacks.forEach((cb) => cb(newVal, oldVal));
      }
    });
  }
}
