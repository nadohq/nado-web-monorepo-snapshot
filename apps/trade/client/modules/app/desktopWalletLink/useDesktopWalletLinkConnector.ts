import {
  AppManagedWalletConnector,
  KNOWN_CONNECTOR_IDS,
  useEVMContext,
} from '@nadohq/react-client';
import { DESKTOP_WALLET_LINK_URI_SCHEME } from 'client/modules/app/desktopWalletLink/const';
import { DesktopWalletLinkData } from 'client/modules/app/desktopWalletLink/types';
import { getUserStateWithDefaults } from 'client/modules/localstorage/userState/defaultUserState';
import { userStateSchema } from 'client/modules/localstorage/userState/userStateSchema';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { addressValidator } from 'client/utils/inputValidators';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';

const desktopWalletLinkSchema = z.object({
  sessionUserState: z.object({
    signingPreferenceBySubaccountKey:
      userStateSchema.shape.signingPreferenceBySubaccountKey,
    selectedSubaccountNameByChainEnv:
      userStateSchema.shape.selectedSubaccountNameByChainEnv,
  }),
  address: addressValidator,
});

const uriValidator = z
  .string()
  .startsWith(DESKTOP_WALLET_LINK_URI_SCHEME)
  .transform((uri) => uri.replace(DESKTOP_WALLET_LINK_URI_SCHEME, ''));

/**
 * Decodes and validates a base64-encoded wallet link payload with the
 * `nado://` prefix. This payload typically comes from a scanned QR code.
 *
 * The function performs the following steps:
 * 1. Strips the `nado://` URI scheme prefix.
 * 2. Decodes the remaining base64 string to obtain a JSON payload.
 * 3. Parses and validates the payload using `desktopWalletLinkSchema`.
 *
 * If the input is malformed (invalid base64, bad JSON, or fails schema validation),
 * the function logs the error and returns `undefined`.
 *
 * @param encodedWalletLinkUri - A string starting with `nado://` followed by a base64-encoded JSON payload.
 * @returns A validated {@link DesktopWalletLinkData} object, or `undefined` if decoding or validation fails.
 *
 * @throws Will not throw, but logs and safely returns `undefined` on failure.
 */
function decodeDesktopWalletLinkData(
  encodedWalletLinkUri: string,
): DesktopWalletLinkData | undefined {
  try {
    const parsedUri = uriValidator.safeParse(encodedWalletLinkUri);
    if (!parsedUri.success) {
      throw new Error(
        `[decodeDesktopWalletLinkData] Invalid wallet link URI: ${parsedUri.error}`,
      );
    }

    const base64Input = parsedUri.data;
    const jsonString = atob(base64Input);
    const rawData = JSON.parse(jsonString);

    const parsedWalletLinkData = desktopWalletLinkSchema.safeParse(rawData);

    if (!parsedWalletLinkData.success) {
      throw new Error(
        `[decodeDesktopWalletLinkData] Invalid wallet link data: ${parsedWalletLinkData.error}`,
      );
    }

    return parsedWalletLinkData.data;
  } catch (error) {
    console.error(
      '[decodeDesktopWalletLinkData]: Failed to decode wallet link data',
      error,
    );
  }
}

export function useDesktopWalletLinkConnector() {
  const { connect, connectors, connectionStatus } = useEVMContext();
  const { setSavedUserStateByAddress } = useSavedUserState();

  const connectWithDesktopWalletLink = useCallback(
    (encodedWalletLinkUri: string) => {
      const walletLinkData = decodeDesktopWalletLinkData(encodedWalletLinkUri);

      if (!walletLinkData) {
        return;
      }

      const desktopWalletLinkConnector = connectors.find(
        (connector) => connector.id === KNOWN_CONNECTOR_IDS.desktopWalletLink,
      ) as AppManagedWalletConnector | undefined;

      if (!desktopWalletLinkConnector) return;

      // Update user state for the address with the provided session user state.
      setSavedUserStateByAddress((prev) => {
        return {
          ...prev,
          [walletLinkData.address]: getUserStateWithDefaults({
            ...prev[walletLinkData.address],
            ...walletLinkData.sessionUserState,
          }),
        };
      });

      desktopWalletLinkConnector.setAddressOverride(walletLinkData.address);

      connect(desktopWalletLinkConnector);
    },
    [connectors, setSavedUserStateByAddress, connect],
  );

  const isDesktopWalletLinkConnected = useMemo(
    () =>
      connectionStatus.connector?.id === KNOWN_CONNECTOR_IDS.desktopWalletLink,
    [connectionStatus.connector?.id],
  );

  return {
    connectWithDesktopWalletLink,
    isDesktopWalletLinkConnected,
  };
}
