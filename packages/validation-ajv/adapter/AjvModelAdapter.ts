import { AbstractStatelessDataModel, ValidationResult } from '@meta/validation-core';
import Ajv, { ValidateFunction } from 'ajv';

export class AjvAdapter<T extends Record<string, any>> extends AbstractStatelessDataModel<T> {
  private validateFn: ValidateFunction;

  constructor(ajvInstance: Ajv, schema: object) {
    super();
    // Ajv compiles the schema once into a fast JS function!
    this.validateFn = ajvInstance.compile(schema);
  }

  protected performLibraryValidation(data: unknown): ValidationResult {
    const isValid = this.validateFn(data);
    if (isValid) return { isValid: true, errors: [] };

    return {
      isValid: false,
      errors: this.validateFn.errors!.map(e => ({
        // Map Ajv's JSON Pointer path (/user/name) to our dot-notation (user.name)
        path: e.instancePath.replace(/^\//, '').replace(/\//g, '.'),
        message: e.message || 'Validation failed'
      }))
    };
  }
}
