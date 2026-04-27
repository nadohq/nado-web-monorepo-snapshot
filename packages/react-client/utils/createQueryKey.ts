import safeStringify from 'safe-stable-stringify';

/**
 * Standardized function to create a query key for React Query.
 * The query key is terminated early if an undefined value is encountered. This
 * is useful for query refetching as we can refetch with createQueryKey('label')
 * and have RQ refetch all queries prefixed with 'label'.
 */
export function createQueryKey(label: string, ...args: unknown[]): string[] {
  const baseKey = [label, ...args];

  const queryKey: string[] = [];
  for (const key of baseKey) {
    if (key === undefined) {
      break;
    }

    if (key === null) {
      queryKey.push('null');
    } else if (Array.isArray(key) || typeof key === 'object') {
      // Stringify arrays & objects
      queryKey.push(safeStringify(key));
    } else {
      // Primitives can be mapped to string
      queryKey.push(key.toString());
    }
  }

  return queryKey;
}
