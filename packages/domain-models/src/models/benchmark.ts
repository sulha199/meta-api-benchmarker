import { z } from 'zod';
import { ZodModelAdapter } from '@meta/validation-engine';

// 1. Define the Business Schema
export const BenchmarkSchema = z.object({
  environment: z.enum(['Node.js', 'Supabase']),
  payloadSizeKb: z.number().positive(),
  totalRoundtripMs: z.number().optional(),
  backendParseMs: z.number().optional(),
  backendDbInsertMs: z.number().optional(),
  networkOverheadMs: z.number().optional(),
  visitorId: z.string().uuid()
});

export type Benchmark = z.infer<typeof BenchmarkSchema>;

// 2. Export a pre-configured Model Class for the UI/Backend
export class BenchmarkModel extends ZodModelAdapter<Benchmark> {
  constructor(initialData?: Partial<Benchmark>) {
    super(BenchmarkSchema, initialData);
  }
}
