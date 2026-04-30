import { GraphQLResolveInfo, FieldNode, SelectionSetNode } from 'graphql';

export type ParseSelectionSetResult = {
  [fieldName: string]: {
    children: ParseSelectionSetResult;
  } | {
    children?: undefined;
  };
};

/**
 * Recursively parses a GraphQL SelectionSet into a simple dictionary object.
 */
function parseSelectionSet(selectionSet?: SelectionSetNode): ParseSelectionSetResult {
  const fields: ParseSelectionSetResult = {};

  if (!selectionSet) return fields;

  for (const selection of selectionSet.selections) {
    // We only care about explicit fields (ignoring Fragments for this benchmark)
    if (selection.kind === 'Field') {
      const fieldNode = selection as FieldNode;
      const fieldName = fieldNode.name.value;

      // If this field has nested sub-fields (like 'data' or 'comments'), parse them recursively
      if (fieldNode.selectionSet) {
        fields[fieldName] = {
          children: parseSelectionSet(fieldNode.selectionSet),
        };
      } else {
        // It's a scalar leaf node (like 'id' or 'title')
        fields[fieldName] = {};
      }
    }
  }
  return fields;
}

/**
 * Extracts the exact requested fields from the GraphQL resolve info.
 */
export function getRequestedFields(info: GraphQLResolveInfo): ParseSelectionSetResult {
  // info.fieldNodes[0] represents the current query/mutation being executed
  const fieldNode = info.fieldNodes[0];

  return parseSelectionSet(fieldNode.selectionSet);
}
