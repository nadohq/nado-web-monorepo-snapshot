/**
 * A centralized place to store sensitive (but not "secret") items such that we can easily delete the items
 * in this file for open sourcing.
 */
export const SENSITIVE_DATA = {
  fuulApiKey:
    '',
  funkitApiKey: '',
  googleTagManagerId: {
    prod: '',
    testnet: '',
  },
  notifi: {
    tenantId: '',
    cardId: {
      inkProd: '',
      inkTestnet: '',
    },
  },
  privy: {
    prod: {
      appId: '',
      clientId: '',
    },
    testnet: {
      appId: '',
      clientId: '',
    },
  },
  lifiIntegrator: '',
  sentryDsn:
    '',
} as const;
