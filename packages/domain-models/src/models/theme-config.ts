import { z } from 'zod';
import { ZodModelAdapter } from '@meta/validation-engine';

/**
 * Zod Schema for UI Theme Configuration.
 * This defines the aesthetic and regional preferences of the visitor.
 */
export const ThemeConfigSchema = z.object({
  mode: z.enum(['light', 'dark', 'system']).default('system'),
  primaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid Hex Color").default('#3b82f6'),
  fontFamily: z.enum(['sans', 'serif', 'mono']).default('sans'),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md'),
  language: z.enum(['en', 'id', 'ar']).default('en'), // 'ar' will trigger RTL layout
});

// Extract the TypeScript type from the schema
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

/**
 * ThemeConfigModel class.
 * Used by the Frontend to manage UI state with built-in validation.
 */
export class ThemeConfigModel extends ZodModelAdapter<ThemeConfig> {
  constructor(initialData?: Partial<ThemeConfig>) {
    super(ThemeConfigSchema, initialData);
  }
}
