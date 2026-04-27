import { useEVMContext } from '@nadohq/react-client';
import { NOT_CONNECTED_ALT_QUERY_ADDRESS } from 'client/hooks/query/consts/notConnectedAltQueryAddress';

/**
 * Gives a relevant key for localstorage user states, defaults to NOT_CONNECTED_ALT_QUERY_ADDRESS if not connected
 * Note that we can't use the zeroAddress because it holds valid subaccounts for the NLP
 * @returns The user's address or NOT_CONNECTED_ALT_QUERY_ADDRESS if not connected
 */
export function useLocalStorageAddressKey() {
  const {
    connectionStatus: { address },
  } = useEVMContext();

  return address ?? NOT_CONNECTED_ALT_QUERY_ADDRESS;
}
