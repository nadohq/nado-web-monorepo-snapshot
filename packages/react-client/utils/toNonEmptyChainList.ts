import type { Chain } from 'viem';

/**
 * Converts a chain array/iterable into Wagmi's required non-empty tuple type,
 * throwing if the input is empty.
 */
export function toNonEmptyChainList(
  chains: Iterable<Chain>,
): readonly [Chain, ...Chain[]] {
  const [firstChain, ...restChains] = Array.from(chains);
  if (!firstChain) {
    throw new Error('No supported chains configured');
  }
  return [firstChain, ...restChains];
}
