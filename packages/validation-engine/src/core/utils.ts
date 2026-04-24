// Helper function to clone nodes based on their type
function cloneNode<T>(node: T): T {
  if (Array.isArray(node)) return [...node] as unknown as T;
  if (node !== null && typeof node === 'object') return { ...node };
  return node;
}

// Immutable setter: Updates nested values without mutating unrelated object references
export function setImmutable<T>(obj: Partial<T>, path: string, value: any): Partial<T> {
  const keys = path.split('.');
  const result = cloneNode(obj) || {};
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    // If the current node doesn't exist, initialize it as an Array or Object based on the next key
    if (current[key] === undefined || current[key] === null) {
      const isNextKeyArrayIndex = !isNaN(Number(nextKey));
      current[key] = isNextKeyArrayIndex ? [] : {};
    } else {
      // Node exists, clone its content to maintain immutability
      current[key] = cloneNode(current[key]);
    }

    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result as Partial<T>;
}
