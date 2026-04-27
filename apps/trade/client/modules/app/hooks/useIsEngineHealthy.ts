import { useQueryEngineStatus } from 'client/hooks/query/useQueryEngineStatus';

export function useIsEngineHealthy(): boolean {
  const { data: engineStatus } = useQueryEngineStatus();

  return engineStatus === 'active';
}
