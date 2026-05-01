import type { ParseSelectionSetResult } from './astParser';
import type { DataQueryPlan } from '@repo/db-core';

export function buildDataQueryPlan<TSelect extends Record<string, any>>(
  astResult: ParseSelectionSetResult
): DataQueryPlan<TSelect> {
  const fields: string[] = [];
  const relations: Record<string, any> = {};

  for (const [key, node] of Object.entries(astResult)) {
    if (node.children) {
      // Recursively build the child plan
      relations[key] = buildDataQueryPlan<any>(node.children);
    } else {
      fields.push(key);
    }
  }

  // Cast the final result to satisfy our strict compiler boundaries
  return { fields, relations } as unknown as DataQueryPlan<TSelect>;
}
