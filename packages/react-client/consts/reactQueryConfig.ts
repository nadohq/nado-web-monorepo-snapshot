export const REACT_QUERY_CONFIG = {
  // GC Time for queries that just compute data and don't fetch through a REST call
  // These have dependency arrays based on the lastUpdateTime of dependent queries, so the query keys change quite often
  computeQueryGcTime: 1000,
  // Use a lower stale time for computed queries as these are exempt from rate limits
  computedQueryStaleTime: 2000,
  // Force refetch for certain computed queries where we don't re-compute on updated data
  computedQueryRefetchInterval: 2000,
  // Stale time determines when a new component mount should trigger a refresh. By default this is 0,
  // which results in repeated fetches if a query is used in multiple components.
  // We usually specify query refreshes manually, so we set this to a higher value to avoid unnecessary fetches.
  defaultQueryStaleTime: 30000,
};
