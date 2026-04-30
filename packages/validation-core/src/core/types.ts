export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export type CustomValidator<T> = (value: T) => ValidationError | null | Promise<ValidationError | null>;

// Utility to extract the element type of an Array
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

// Recursively traces object paths (Supports nested objects, array indices, and unions)
export type Path<T> = T extends any ? (
  T extends ReadonlyArray<infer V> ?
    `${number}` | `${number}.${Path<V>}`
  : T extends object ? {
      [K in keyof T & (string | number)]: K extends string ?
          T[K] extends object ? `${K}` | `${K}.${Path<T[K]>}` : `${K}`
      : never;
    }[keyof T & (string | number)]
  : never
) : never;

// Retrieves the value type based on the specified Path
export type PathValue<T, P extends Path<T>> = T extends any ? (
  P extends `${infer K}.${infer Rest}` ?
      K extends keyof T ?
          Rest extends Path<T[K]> ? PathValue<T[K], Rest> : never
      : never
  : P extends keyof T ? T[P] : never
) : never;
