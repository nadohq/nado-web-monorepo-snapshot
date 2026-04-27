/**
 * Standard weights for search across the application.
 * Higher weights indicate higher priority in search results.
 */
export const SEARCH_WEIGHTS = {
  /**
   * Highest weight for primary search terms
   */
  HIGH: 1,

  /**
   * Medium weight for secondary search terms
   */
  MEDIUM: 0.8,
} as const;

export type SearchWeight = (typeof SEARCH_WEIGHTS)[keyof typeof SEARCH_WEIGHTS];
