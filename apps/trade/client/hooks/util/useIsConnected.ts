import { useEVMContext } from '@nadohq/react-client';

export function useIsConnected() {
  const { connectionStatus } = useEVMContext();

  return connectionStatus.type === 'connected';
}
