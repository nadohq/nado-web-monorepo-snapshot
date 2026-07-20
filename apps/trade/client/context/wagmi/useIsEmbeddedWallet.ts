import { usePrivy } from '@privy-io/react-auth';
import { useMultiWagmi } from 'client/context/wagmi/useMultiWagmi';

export function useIsEmbeddedWallet() {
  const { activeWagmiProvider } = useMultiWagmi();
  const { ready, authenticated, user } = usePrivy();

  if (activeWagmiProvider !== 'privy') {
    return false;
  }

  if (!ready || !authenticated || !user || !user.wallet) {
    return false;
  }

  return user.wallet.connectorType === 'embedded';
}
