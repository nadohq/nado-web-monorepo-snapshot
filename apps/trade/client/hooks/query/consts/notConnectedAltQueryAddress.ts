/**
 * Zero address is used for the NLP, so we use an alternative address to represent not connected state in queries.
 * This is also used in rewards queries as Fuul uses the zero address for special purposes.
 */
export const NOT_CONNECTED_ALT_QUERY_ADDRESS =
  '0xfffffffffffffffffffffffffffffffffffffffe';
