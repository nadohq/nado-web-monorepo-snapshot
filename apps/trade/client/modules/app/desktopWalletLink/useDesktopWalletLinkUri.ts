import { useEVMContext } from '@nadohq/react-client';
import { DESKTOP_WALLET_LINK_URI_SCHEME } from 'client/modules/app/desktopWalletLink/const';
import { DesktopWalletLinkData } from 'client/modules/app/desktopWalletLink/types';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useMemo } from 'react';
import safeStringify from 'safe-stable-stringify';

/**
 * Encodes a {@link DesktopWalletLinkData} object into a base64-encoded URI
 * string with the `nado://` scheme prefix.
 *
 * This is typically used to generate a scannable QR code link that embeds
 * the user's address and session settings in a portable format.
 *
 * @param data - The wallet link data to encode, including the user's address
 * and session-specific preferences.
 * @returns A `nado://<base64-encoded-payload>` string if successful,
 * or `undefined` if encoding fails.
 *
 * @example
 * const uri = encodeDesktopWalletLinkData({
 *   address: '0x123...',
 *   sessionUserState: { ... }
 * });
 * // Result: "nado://<encoded-data>"
 */
function encodeDesktopWalletLinkData(
  data: DesktopWalletLinkData,
): string | undefined {
  try {
    const jsonString = safeStringify(data);

    return `${DESKTOP_WALLET_LINK_URI_SCHEME}${btoa(jsonString)}`;
  } catch (error) {
    console.error(
      '[encodeDesktopWalletLinkData]: Failed to encode wallet link data',
      error,
    );
  }
}

/**
 * React hook that generates a desktop wallet link URI based on the
 * currently connected user and their saved session settings.
 *
 * The returned URI is compatible with `nado://` links and is suitable
 * for use in QR codes or deep linking workflows that allow another device to
 * connect with the same user context.
 *
 * @returns A `nado://<base64-encoded-payload>` string containing
 * the user's address and session settings, or `undefined` if the user is not connected.
 *
 * @example
 * const uri = useDesktopWalletLinkUri();
 * if (uri) {
 *   displayAsQRCode(uri);
 * }
 */
export function useDesktopWalletLinkUri() {
  const { savedUserState } = useSavedUserState();
  const { connectionStatus } = useEVMContext();

  return useMemo(() => {
    const userAddress = connectionStatus?.address;

    if (!userAddress) return;

    return encodeDesktopWalletLinkData({
      address: userAddress,
      sessionUserState: {
        signingPreferenceBySubaccountKey:
          savedUserState.signingPreferenceBySubaccountKey,
        selectedSubaccountNameByChainEnv:
          savedUserState.selectedSubaccountNameByChainEnv,
      },
    });
  }, [
    connectionStatus?.address,
    savedUserState.selectedSubaccountNameByChainEnv,
    savedUserState.signingPreferenceBySubaccountKey,
  ]);
}
