import { createQueryKey, QueryDisabledError } from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import {
  Address,
  getAddress,
  getChainContractAddress,
  isAddress,
  type PublicClient,
  toCoinType,
} from 'viem';
import { mainnet } from 'viem/chains';
import { usePublicClient } from 'wagmi';

// Minimal ABI for `reverseWithGateways` on the ENS Universal Resolver V2.
// The first argument is the lookup address (20 bytes), same as viem's
// `getEnsName` — not DNS-encoded `{hex}.addr.reverse`.
const UNIVERSAL_RESOLVER_ABI = [
  {
    name: 'reverseWithGateways',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'reverseName', type: 'bytes' },
      { name: 'coinType', type: 'uint256' },
      { name: 'gateways', type: 'string[]' },
    ],
    outputs: [
      { name: 'resolvedName', type: 'string' },
      { name: 'resolver', type: 'address' },
      { name: 'reverseResolver', type: 'address' },
    ],
  },
] as const;

/** Only addresses with a resolved primary ENS name are present as keys. */
export type EnsNamesByAddress = Partial<Record<Address, string>>;

export function ensNamesQueryKey(addresses?: Address[]) {
  return createQueryKey('ensNames', addresses);
}

interface Params {
  /**
   * Addresses to resolve ENS names for. The hook normalizes (checksummed +
   * deduplicated) before issuing a single multicall.
   */
  addresses: string[] | undefined;
}

/**
 * Batch reverse-resolves a set of addresses to their primary ENS names using a
 * single multicall against the ENS Universal Resolver on Ethereum mainnet.
 *
 * Addresses without a primary name are omitted from the result map.
 */
export function useQueryEnsNames({ addresses }: Params) {
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const normalizedAddresses = normalizeEnsLookupAddresses(addresses);
  const disabled = !publicClient || normalizedAddresses.length === 0;

  return useQuery({
    queryKey: ensNamesQueryKey(normalizedAddresses),
    queryFn: async (): Promise<EnsNamesByAddress> => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      return fetchEnsNames(publicClient, normalizedAddresses);
    },
    enabled: !disabled,
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Validates, checksums, deduplicates, and sorts addresses so identical sets
 * share a query cache entry regardless of input order or casing.
 */
function normalizeEnsLookupAddresses(
  addresses: string[] | undefined,
): Address[] {
  if (!addresses?.length) {
    return [];
  }

  const unique = new Set<Address>();
  for (const raw of addresses) {
    if (!isAddress(raw)) {
      continue;
    }
    unique.add(getAddress(raw));
  }

  return Array.from(unique).sort();
}

/**
 * Batch reverse-resolves addresses to primary ENS names via one mainnet
 * multicall against the ENS Universal Resolver.
 */
async function fetchEnsNames(
  publicClient: PublicClient,
  addresses: Address[],
): Promise<EnsNamesByAddress> {
  if (!addresses.length) {
    return {};
  }

  const universalResolverAddress = getChainContractAddress({
    chain: mainnet,
    contract: 'ensUniversalResolver',
  });

  const multicallResult = await publicClient.multicall({
    // Per-address failures (e.g. CCIP-Read reverts) shouldn't fail the
    // whole batch — unresolved entries are omitted from the result map.
    allowFailure: true,
    contracts: addresses.map((address) => ({
      address: universalResolverAddress,
      abi: UNIVERSAL_RESOLVER_ABI,
      functionName: 'reverseWithGateways' as const,
      args: [address, toCoinType(mainnet.id), []] as const,
    })),
  });

  const namesByAddress: EnsNamesByAddress = {};

  addresses.forEach((address, index) => {
    const result = multicallResult[index];

    if (result.status !== 'success') {
      return;
    }

    const [resolvedName] = result.result;

    if (resolvedName) {
      namesByAddress[address] = resolvedName;
    }
  });

  return namesByAddress;
}
