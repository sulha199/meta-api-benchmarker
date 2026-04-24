import { ValidationResult, CustomValidator, Path, PathValue, ArrayElement } from './types';
import { setImmutable } from './utils';

type TransformerFn = (val: any) => any;
type DataChangeListenerFn = (newVal: any, oldVal: any) => void;
type ValidationChangeListenerFn = (result: ValidationResult) => void;

export abstract class AbstractDataModel<T extends Record<string, any>> {
  protected _value: Partial<T> = {};
  protected _lastValidationResult: ValidationResult = { isValid: true, errors: [] };

  protected _customValidators: CustomValidator<T>[] = [];
  protected _transformers = new Map<string, TransformerFn[]>();

  protected _dataChangeListeners = new Map<string, DataChangeListenerFn[]>();
  protected _validationChangeListeners: ValidationChangeListenerFn[] = [];

  constructor(initialValue?: Partial<T>) {
    if (initialValue) this._value = initialValue;
  }

  get value(): Partial<T> { return this._value; }

  protected abstract performLibraryValidation(data: Partial<T>): ValidationResult;

  public getValueAt<P extends Path<T>>(path: P): PathValue<T, P> | undefined {
    return this._extractValue(this._value, path as string);
  }

  // --- Transformer & Listener Methods ---

  /**
   * Registers a transformer function that intercepts and modifies data at a specific path.
   */
  public addTransformer<P extends Path<T>>(
    path: P,
    transformer: (val: PathValue<T, P> | undefined) => PathValue<T, P>
  ) {
    const pathStr = path as string;
    if (!this._transformers.has(pathStr)) this._transformers.set(pathStr, []);
    this._transformers.get(pathStr)!.push(transformer as TransformerFn);
  }

  // --- Event Subscription Methods ---
  /**
   * Subscribes to changes at a specific path.
   * Triggers only when the value at this exact path changes.
   */

  public onDataChange<P extends Path<T>>(
    path: P,
    callback: (newVal: PathValue<T, P> | undefined, oldVal: PathValue<T, P> | undefined) => void
  ) {
    const pathStr = path as string;
    if (!this._dataChangeListeners.has(pathStr)) this._dataChangeListeners.set(pathStr, []);
    this._dataChangeListeners.get(pathStr)!.push(callback as DataChangeListenerFn);
  }

  /**
   * Subscribes to validation-event at a specific path.
  */
  public onValidationChange(callback: ValidationChangeListenerFn) {
    this._validationChangeListeners.push(callback);
  }


  // --- Core Mutation Method ---

  public async setValueAt<P extends Path<T>>(path: P, value: PathValue<T, P>): Promise<ValidationResult> {
      const pathStr = path as string;

      if (this.getValueAt(path) === value) {
        return this._lastValidationResult;
      }

      const oldTree = this._value;
      let nextTree = setImmutable(this._value, pathStr, value);

      nextTree = this._applyTransformers(nextTree, pathStr);
      this._value = nextTree;

      // 1. Fire Data Event (Sync)
      this._fireDataChangeListeners(oldTree, nextTree);

      // 2. Await Validation Event (Async)
      return await this.validate();
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

  // --- Validation ---

  public addCustomValidator(v: CustomValidator<T>) { this._customValidators.push(v); }

  public async validate(): Promise<ValidationResult> {
      const libResult = this.performLibraryValidation(this._value);
      let allErrors = [...libResult.errors];

      for (const v of this._customValidators) {
        const err = await v(this._value as T);
        if (err) allErrors.push(err);
      }

      const newResult = { isValid: allErrors.length === 0, errors: allErrors };

      const isValidationChanged =
        this._lastValidationResult.isValid !== newResult.isValid ||
        this._lastValidationResult.errors.length !== newResult.errors.length;

      this._lastValidationResult = newResult;

      // Fire Validation Event
      if (isValidationChanged) {
        this._fireValidationChangeListeners();
      }

      return this._lastValidationResult;
    }

  public getErrorsAt<P extends Path<T>>(path: P): string[] {
    return this._lastValidationResult.errors
      .filter(e => e.path === path || e.path.startsWith(`${path as string}.`))
      .map(e => e.message);
  }

  // --- Internal Helpers ---

  private _extractValue(tree: any, path: string): any {
    if (!tree) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], tree);
  }

  private _applyTransformers(tree: Partial<T>, triggerPath: string): Partial<T> {
    let updatedTree = tree;

    this._transformers.forEach((fns, targetPath) => {
      // Check if the change at triggerPath affects the targetPath
      // Matches exact path, parent paths, or child paths
      const isAffected = targetPath === triggerPath ||
                         targetPath.startsWith(`${triggerPath}.`) ||
                         triggerPath.startsWith(`${targetPath}.`);

      if (isAffected) {
        const currentVal = this._extractValue(updatedTree, targetPath);
        let newVal = currentVal;

        for (const fn of fns) {
          newVal = fn(newVal);
        }

        // SMART CHECK 2: Only apply immutable update if the transformer ACTUALLY mutated the value
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

  private _fireValidationChangeListeners() {
    this._validationChangeListeners.forEach(cb => cb(this._lastValidationResult));
  }
}
