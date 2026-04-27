import { DisabledUI, HiddenUI, WidgetConfig, WidgetTheme } from '@lifi/widget';
import { ChainEnv } from '@nadohq/client';
import { MIN_INITIAL_DEPOSIT_VALUE } from 'client/hooks/subaccount/useMinInitialDepositAmountByProductId';
import { getResolvedColorValue } from 'client/modules/theme/colorVars';
import { SENSITIVE_DATA } from 'common/environment/sensitiveData';
import { ink } from 'viem/chains';

/**
 * Get dynamic theme configuration using app's color system
 */
function getThemeConfig(): WidgetTheme {
  return {
    colorSchemes: {
      dark: {
        palette: {
          primary: {
            main: getResolvedColorValue('primary'),
          },
          text: {
            primary: getResolvedColorValue('text-primary'),
            secondary: getResolvedColorValue('text-secondary'),
            disabled: getResolvedColorValue('text-tertiary'),
          },
          success: {
            main: getResolvedColorValue('positive'),
          },
          warning: {
            main: getResolvedColorValue('warning'),
          },
          error: {
            main: getResolvedColorValue('negative'),
          },
          background: {
            default: getResolvedColorValue('surface-card'),
            paper: getResolvedColorValue('surface-1'),
          },
          secondary: {
            main: getResolvedColorValue('primary'),
          },
          grey: {
            800: getResolvedColorValue('overlay-divider'),
          },
        },
      },
    },
    container: {
      // Override the default height to ensure none of the content is cut off.
      // `100%` cuts off some of the content, so we need to set it to `fit-content`.
      height: 'fit-content',
      // Override the default max-height to 100% to limit the widget height to the container.
      maxHeight: '100%',
      // Override the default maxWidth to 100% to allow the widget to take up the full width of the container.
      maxWidth: '100%',
    },
    shape: {
      borderRadius: 8,
      borderRadiusSecondary: 8,
    },
    typography: {
      fontFamily: 'inherit',
      // Define all typography variants with consistent sizing
      body2: {
        fontSize: '14px !important',
        color: getResolvedColorValue('text-tertiary'),
      },
    },
  };
}

/**
 * LI.FI Widget configuration for cross-chain swaps and bridging
 * Documentation: https://docs.li.fi/widget/configure-widget
 */
export const DEFAULT_LIFI_WIDGET_CONFIG: WidgetConfig = {
  // Theme configuration - dynamically resolved from app theme
  get theme() {
    return getThemeConfig();
  },
  appearance: 'dark',
  integrator: SENSITIVE_DATA.lifiIntegrator,
  // Widget appearance and behavior
  variant: 'compact',
  subvariant: 'default',
  // Add 1 USD for some buffer above the minimum
  minFromAmountUSD: MIN_INITIAL_DEPOSIT_VALUE.toNumber() + 1,
  // SDK configuration
  sdkConfig: {
    routeOptions: {
      slippage: 0.01, // 1% default slippage
      // Prevent swaps on the destination chain, which increase probability of failed transfers
      allowDestinationCall: false,
    },
  },

  // Hide specific UI elements
  hiddenUI: [
    HiddenUI.WalletMenu,
    HiddenUI.Appearance,
    HiddenUI.AddressBookConnectedWallets,
    HiddenUI.LowAddressActivityConfirmation,
    HiddenUI.ReverseTokensButton,
  ],

  // Disable specific features
  disabledUI: [DisabledUI.ToAddress],

  // Language configuration
  languages: {
    default: 'en',
  },
};

/**
 * Map chain env to chain id for Li.Fi widget
 * This is to used to avoid testnet chains from being used in the widget
 */
export const LIFI_CHAIN_ENV_TO_CHAIN_ID: Record<ChainEnv, number> = {
  inkMainnet: ink.id,
  inkTestnet: ink.id,
  local: ink.id,
};
