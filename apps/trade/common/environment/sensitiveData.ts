/**
 * A centralized place to store sensitive (but not "secret") items such that we can easily delete the items
 * in this file for open sourcing.
 */
export const SENSITIVE_DATA = {
  fuulApiKey: '',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  microsoftClarityId: '',
  walletConnectProjectId: '',
  notifi: {
    tenantId: '',
    cardId: {
      inkProd: '',
      inkTestnet: '',
    },
  },
  lifiIntegrator: '',
  sentryDsn: '',
} as const;
