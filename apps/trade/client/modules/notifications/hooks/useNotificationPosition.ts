import { NotificationPosition } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

/**
 * Hook for managing the user's toast notification position preference.
 * @returns Object containing the current notification position and setter function
 */
export function useNotificationPosition() {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const setNotificationPosition = useCallback(
    (newVal: NotificationPosition) => {
      setSavedUserState((prev) => {
        prev.notificationPosition = newVal;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return {
    notificationPosition: savedUserState.notificationPosition,
    setNotificationPosition,
  };
}
