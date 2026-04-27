import { getDefaultRecvTime } from '@nadohq/client';
import { useGetNowTimeInMillis } from 'client/hooks/util/useGetNowTime';
import { useCallback } from 'react';

/**
 * Util hook for computing recvTime from current time.
 */
export function useGetRecvTime() {
  const getNowTimeInMillis = useGetNowTimeInMillis();

  return useCallback(async () => {
    return getDefaultRecvTime(getNowTimeInMillis());
  }, [getNowTimeInMillis]);
}
