import {
  AbstractStatefulDataModel,
  ValidationResult,
} from "@meta/validation-core";
import { z } from "zod";

export class ZodStatefulModelAdapter<
  T extends Record<string, any>,
> extends AbstractStatefulDataModel<T> {
  constructor(
    private schema: z.ZodType<T, any, any>,
    initialValue?: Partial<T>,
  ) {
    super(initialValue);
  }

  protected performLibraryValidation(data: Partial<T>): ValidationResult {
    const result = this.schema.safeParse(data);
    if (result.success) return { isValid: true, errors: [] };

    // Map Zod errors to our standardized ValidationError format
    return {
      isValid: false,
      errors: result.error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    };
  }
}
