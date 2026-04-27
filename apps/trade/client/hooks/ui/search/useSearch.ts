import { useCreation, useDebounce } from 'ahooks';
import { SearchWeight } from 'client/hooks/ui/search/consts';
import Fuse from 'fuse.js';
import { useMemo } from 'react';
import { Paths } from 'type-fest';

interface SearchKey<TItem> {
  /**
   * Property path to search within each item
   */
  name: Paths<TItem> & string;
  /**
   * Relative importance of this search key (higher = more important)
   */
  weight: SearchWeight;
}

interface SearchConfig<TItem> {
  /**
   * Items to search through
   */
  items: TItem[] | undefined;
  /**
   * Keys to search and their relative importance
   */
  searchKeys: SearchKey<TItem>[];
  /**
   * Search threshold (0 = exact match, 1 = very loose matching), default is 0.15
   */
  threshold?: number;
  /**
   * Minimum characters required to trigger search, default is 1
   */
  minMatchCharLength?: number;
  /**
   * Debounce delay in milliseconds, default is 200
   */
  debounceMillis?: number;
}

interface SearchResult<TItem> {
  /**
   * Filtered search results
   */
  results: TItem[];
  /**
   * Processed query that was searched
   */
  normalizedQuery: string;
}

interface SearchParams<TItem> {
  query: string;
  config: SearchConfig<TItem>;
}

/**
 * Hook for performing a search on a list of items.
 *
 * @template TItem - Type of items to search.
 *
 * @param {SearchParams<TItem>} params - Contains the search query and configuration.
 * @param {string} params.query - The search query string.
 * @param {SearchConfig<TItem>} params.config - Configuration for the search.
 *
 * @returns {SearchResult<TItem>} The search results and the normalized query.
 */
export function useSearch<TItem>({
  query,
  config: {
    items,
    searchKeys,
    threshold = 0.15,
    minMatchCharLength = 1,
    debounceMillis = 200,
  },
}: SearchParams<TItem>): SearchResult<TItem> {
  const emptyItems = useCreation<TItem[]>(() => [], []);
  const searchItems = items ?? emptyItems;

  const searchEngine = useMemo(() => {
    const fuseOptions = {
      includeScore: true,
      findAllMatches: true,
      threshold,
      minMatchCharLength,
      keys: searchKeys,
    };

    return new Fuse(searchItems, fuseOptions);
  }, [threshold, minMatchCharLength, searchKeys, searchItems]);

  const debouncedQuery = useDebounce(query, { wait: debounceMillis });

  return useMemo(() => {
    const normalizedQuery = debouncedQuery.trim();

    // Return all items if no search engine or query is empty
    if (!searchItems.length || !normalizedQuery) {
      return {
        results: searchItems,
        normalizedQuery,
      };
    }

    const results = searchEngine.search(normalizedQuery);

    return {
      results: results.map((result) => result.item),
      normalizedQuery,
    };
  }, [debouncedQuery, searchEngine, searchItems]);
}
