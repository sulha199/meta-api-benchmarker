import { AbstractStatelessDataModel } from './AbstractStatelessDataModel';
import { setImmutable } from './utils';
import type { Path, PathValue, ValidationResult, ArrayElement } from './types';

type DataChangeListenerFn = (newVal: any, oldVal: any) => void;
type ValidationChangeListenerFn = (result: ValidationResult) => void;

export abstract class AbstractStatefulDataModel<T extends Record<string, any>> extends AbstractStatelessDataModel<T> {
  protected _value: Partial<T> = {};
  protected _lastValidationResult: ValidationResult = { isValid: true, errors: [] };

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
    callback: (newVal: PathValue<T, P> | undefined, oldVal: PathValue<T, P> | undefined) => void
  ) {
    const pathStr = path as string;
    if (!this._dataChangeListeners.has(pathStr)) this._dataChangeListeners.set(pathStr, []);
    this._dataChangeListeners.get(pathStr)!.push(callback as DataChangeListenerFn);
  }

  public onValidationChange(callback: ValidationChangeListenerFn) {
    this._validationChangeListeners.push(callback);
  }

  // --- Core Mutation Method ---

  public async setValueAt<P extends Path<T>>(path: P, value: PathValue<T, P>): Promise<ValidationResult> {
    const pathStr = path as string;

    // Early return if the value hasn't actually changed
    if (this.getValueAt(path) === value) {
      return this._lastValidationResult;
    }

    const oldTree = this._value;
    let nextTree = setImmutable(this._value, pathStr, value);

    // 1. Apply targeted transformers synchronously before firing data events
    nextTree = this._applyTargetedTransformers(nextTree, pathStr);

    this._value = nextTree;

    // 2. Fire Data Event (Sync)
    this._fireDataChangeListeners(oldTree, nextTree);

    // 3. Await Validation Event (Async)
    return await this.validateCurrentState();
  }

  // --- Array Operations ---

  public async pushValueAt<P extends Path<T>>(
    path: P,
    item: PathValue<T, P> extends readonly unknown[] ? ArrayElement<PathValue<T, P>> : never
  ): Promise<ValidationResult> {
    const arr = (this.getValueAt(path) || []) as any[];
    return await this.setValueAt(path, [...arr, item] as any);
  }

  public async removeValueAt<P extends Path<T>>(path: P, index: number): Promise<ValidationResult> {
    const arr = (this.getValueAt(path) || []) as any[];
    return await this.setValueAt(path, arr.filter((_, i) => i !== index) as any);
  }

  // --- Stateful Validation Pipeline ---

  /**
   * Triggers the parent stateless validation pipeline using the current internal state.
   */
  public async validateCurrentState(): Promise<ValidationResult> {
    // Call the lightning-fast parent method, which also applies global transformers
    const { result: newResult, data: transformedData } = await super.validate(this._value);

    // If super.validate applied global transformers that mutated the tree, update state!
    if (this._value !== transformedData) {
        const oldTree = this._value;
        this._value = transformedData;
        this._fireDataChangeListeners(oldTree, transformedData);
    }

    const isValidationChanged =
      this._lastValidationResult.isValid !== newResult.isValid ||
      this._lastValidationResult.errors.length !== newResult.errors.length;

    this._lastValidationResult = newResult;

    // Fire Validation Event
    if (isValidationChanged) {
      this._validationChangeListeners.forEach(cb => cb(this._lastValidationResult));
    }

    return this._lastValidationResult;
  }

  public getErrorsAt<P extends Path<T>>(path: P): string[] {
    return this._lastValidationResult.errors
      .filter(e => e.path === path || e.path.startsWith(`${path as string}.`))
      .map(e => e.message);
  }

  // --- Internal Helpers ---

  /**
   * Applies transformers selectively only to paths affected by a mutation.
   * This saves computation cycles compared to running the entire global transformer tree.
   */
  private _applyTargetedTransformers(tree: Partial<T>, triggerPath: string): Partial<T> {
    let updatedTree = tree;

    this._transformers.forEach((fns, targetPath) => {
      // Check if the change at triggerPath affects the targetPath
      const isAffected = targetPath === triggerPath ||
                         targetPath.startsWith(`${triggerPath}.`) ||
                         triggerPath.startsWith(`${targetPath}.`);

      if (isAffected) {
        const currentVal = this._extractValue(updatedTree, targetPath);
        let newVal = currentVal;

        for (const fn of fns) {
          newVal = fn(newVal);
        }

        if (newVal !== currentVal) {
          updatedTree = setImmutable(updatedTree, targetPath, newVal);
        }
      }
    });

    return updatedTree;
  }

  private _fireDataChangeListeners(oldTree: Partial<T>, newTree: Partial<T>) {
    this._dataChangeListeners.forEach((callbacks, listenPath) => {
      const oldVal = this._extractValue(oldTree, listenPath);
      const newVal = this._extractValue(newTree, listenPath);

      if (oldVal !== newVal) {
        callbacks.forEach(cb => cb(newVal, oldVal));
      }
    });
  }
}
