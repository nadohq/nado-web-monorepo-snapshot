import {
  truncateAddress,
  truncateMiddle,
  useEVMContext,
} from '@nadohq/react-client';
import { mainnet } from 'viem/chains';
import { useEnsName } from 'wagmi';

interface AddressDisplayName {
  type: 'address' | 'ens';
  displayName: string;
  /**
   * Truncated display name for UI purposes.
   */
  truncatedDisplayName: string;
}

/**
 * Retrieve a displayable string for an address. The logic is as follows:
 * - If the address has an ENS name, return the ENS name.
 * - If the address has no assigned names, return the address.
 *
 * @param {string | undefined} address
 * @returns {AddressDisplayName}
 */
export function useConnectedAddressDisplayName(): AddressDisplayName {
  const {
    connectionStatus: { address },
  } = useEVMContext();

  // Only fetching ENS from mainnet as it's mainly used there and allows for easier testing
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  });

  if (ensName) {
    return {
      type: 'ens',
      displayName: ensName,
      truncatedDisplayName: truncateMiddle(ensName, 7),
    };
  }

  return {
    type: 'address',
    displayName: address ?? '',
    truncatedDisplayName: truncateAddress(address ?? ''),
  };
}
