/**
 * Known IDs of wagmi connectors
 */
export const KNOWN_CONNECTOR_IDS = {
  injected: 'injected',
  walletConnect: 'walletConnect',
  // App managed wallet connectors
  customWallet: 'customWallet',
  xrpl: 'xrpl',
  desktopWalletLink: 'desktopWalletLink',
} as const;

export type KnownConnectorID =
  (typeof KNOWN_CONNECTOR_IDS)[keyof typeof KNOWN_CONNECTOR_IDS];
