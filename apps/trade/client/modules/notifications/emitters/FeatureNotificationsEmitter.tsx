import { ChainEnv } from '@nadohq/client';
import { INK_CHAIN_ENVS, useEVMContext } from '@nadohq/react-client';
import {
  FEATURE_NOTIFICATION_DISCLOSURE_KEYS,
  FeatureNotificationDisclosureKey,
} from 'client/modules/localstorage/userState/types/userDisclosureTypes';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { useEffect } from 'react';
import { toast } from 'sonner';

// If undefined, the notification will be enabled for all chain envs.
type EnabledChainEnvsFilter = ChainEnv[] | undefined;

// All chain envs that are supported by Nado
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NADO_CHAIN_ENVS: ChainEnv[] = [...INK_CHAIN_ENVS];

/**
 * A mapping of new feature key -> chain IDs for which the notification should be enabled.
 * Use `satisfies` to have type-checking that also works when `NewFeatureDisclosureKey` is `never` (when there are no keys)
 */
const ENABLED_NOTIFICATION_CHAIN_ENVS: Record<string, EnabledChainEnvsFilter> =
  {
    new_mkts_apr_23_2026: undefined,
  } satisfies Record<FeatureNotificationDisclosureKey, EnabledChainEnvsFilter>;

export function FeatureNotificationsEmitter() {
  const {
    connectionStatus: { address },
    primaryChainEnv,
  } = useEVMContext();
  const { dispatchNotification } = useNotificationManagerContext();
  const { savedUserState, didLoadPersistedValue } = useSavedUserState();

  const canShowFeatureNotifications = !!address && didLoadPersistedValue;
  const dismissedKeys = savedUserState.dismissedDisclosures;

  useEffect(() => {
    FEATURE_NOTIFICATION_DISCLOSURE_KEYS.forEach((key) => {
      const isDismissed = dismissedKeys.includes(key);
      const isEnabled =
        ENABLED_NOTIFICATION_CHAIN_ENVS[key]?.includes(primaryChainEnv) ?? true;

      const show = !isDismissed && isEnabled && canShowFeatureNotifications;
      if (show) {
        dispatchNotification({
          type: 'new_feature',
          data: key,
        });
      } else {
        // Assume toast ID is the notification key
        toast.dismiss(key);
      }
    });
  }, [
    dismissedKeys,
    dispatchNotification,
    canShowFeatureNotifications,
    primaryChainEnv,
  ]);

  return null;
}
