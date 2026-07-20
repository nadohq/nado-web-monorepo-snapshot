import type { ThemeSet } from '@funkit/connect';
import { darkTheme } from '@funkit/connect';

const DARK_THEME_COLORS = {
  primaryText: '#ffffff',
  secondaryText: '#a5a5a5',
  tertiaryText: '#a5a5a5',
  lightStroke: '#242324',
  mediumStroke: '#2e2d2f',
  heavyStroke: '#383839',
  modalBackground: '#131316',
  actionColor: '#dfdfe1',
  offBackground: '#2e2d2f',
  offBackgroundInverse: '#dfdfe1',
  error: '#ef4444',
};

const CUSTOM_BORDER_RADII = {
  modal: '8px',
  modalActionButton: '4px',
  modalActionButtonMobile: '4px',
  connectButton: '4px',
  dropdown: '4px',
  dropdownList: '4px',
  dropdownItem: '4px',
  qrCode: '8px',
  tooltip: '8px',
  skeleton: '4px',
  actionButton: '4px',
  actionButtonInner: '3px',
  menuButton: '4px',
  summaryBox: '4px',
  youPayYouReceive: '4px',
  inputAmountSwitcher: '4px',
  withdrawalInput: '8px',
  useConnected: '999px',
};

const NADO_FUNKIT_THEME = darkTheme({
  customFontFamily: 'inherit',
  customFontSizings: {
    modalTopbarTitle: { fontSize: '16px', lineHeight: '18px' },
  },
  customColors: {
    ...DARK_THEME_COLORS,
    modalHeaderDivider: 'transparent',
    modalFooterDivider: DARK_THEME_COLORS.mediumStroke,
    modalBorder: DARK_THEME_COLORS.lightStroke,

    buttonBackground: DARK_THEME_COLORS.actionColor,
    buttonBackgroundHover: '#d2d4db',
    buttonBackgroundPressed: '#d2d4db',
    buttonBackgroundDisabled: 'rgba(27, 27, 29, 0.5)',
    buttonTextPrimary: '#131316',
    buttonTextHover: '#131316',
    buttonTextSecondary: '#131316',
    buttonTextDisabled: 'rgba(255, 255, 255, 0.5)',
    buttonFocusedOutline: '0 0 0 2px rgba(255, 255, 255, 0.25)',

    buttonBackgroundTertiary: '#2e2d2f',
    buttonBackgroundHoverTertiary: '#383839',
    buttonBackgroundDisabledTertiary: 'rgba(46, 45, 47, 0.5)',
    buttonTextTertiary: '#ffffff',
    buttonTextDisabledTertiary: 'rgba(255, 255, 255, 0.5)',
    buttonBorderFocusedTertiary: DARK_THEME_COLORS.mediumStroke,

    inputBorderBase: DARK_THEME_COLORS.mediumStroke,
    inputBorderHover: DARK_THEME_COLORS.heavyStroke,
    inputBackground: DARK_THEME_COLORS.modalBackground,
    inputBackgroundHover: 'rgba(255, 255, 255, 0.04)',
    inputLabel: 'rgba(255, 255, 255, 0.8)',
    errorBorder: '#ef4444',

    hoverState: 'rgba(255, 255, 255, 0.06)',
    spinnerBackground: DARK_THEME_COLORS.mediumStroke,

    youPayYouReceiveBorder: DARK_THEME_COLORS.mediumStroke,
    youPayYouReceiveBackground: DARK_THEME_COLORS.modalBackground,

    inputAmountQuickOptionBaseBackground: DARK_THEME_COLORS.offBackground,
    inputAmountQuickOptionBaseBorder: 'transparent',
    inputAmountQuickOptionHoverBackground: 'rgba(223, 223, 225, 0.1)',
    inputAmountQuickOptionHoverBorder: 'transparent',
    inputAmountQuickOptionActiveBorder: 'rgba(223, 223, 225, 0.4)',
    inputAmountQuickOptionFocusedBorder: 'rgba(223, 223, 225, 0.4)',
    focusedOptionBorder: DARK_THEME_COLORS.actionColor,

    modalTopbarIcon: DARK_THEME_COLORS.secondaryText,
    modalTopbarIconBackgroundHover: 'rgba(255, 255, 255, 0.08)',
    buttonIconBackgroundHover: 'rgba(255, 255, 255, 0.08)',

    menuItemBackground: DARK_THEME_COLORS.offBackground,
    optionBoxBackground: 'transparent',
    optionBoxBackgroundUninteractive: 'transparent',
    optionBoxBorderBase: 'rgba(255, 255, 255, 0.06)',
    optionBoxBorderHover: DARK_THEME_COLORS.heavyStroke,
    optionBoxDefaultModeNotActiveBorderBase: 'transparent',
    optionBoxDefaultModeNotActiveBorderHover: 'transparent',

    openDropdownBackgroundColor: DARK_THEME_COLORS.modalBackground,
    selectedDropdownItemText: DARK_THEME_COLORS.actionColor,
    selectedDropdownItemBackground: 'rgba(223, 223, 225, 0.1)',
    dropdownActiveItemBorderBase: DARK_THEME_COLORS.mediumStroke,
    dropdownActiveItemBorderHover: DARK_THEME_COLORS.heavyStroke,
    dropdownActiveItemBackgroundBase: DARK_THEME_COLORS.modalBackground,

    modalBackdrop: 'rgba(0, 0, 0, 0.7)',

    copyButtonBackgroundBase: DARK_THEME_COLORS.offBackground,
    copyButtonBackgroundHover: DARK_THEME_COLORS.heavyStroke,
    copyButtonBackgroundActive: DARK_THEME_COLORS.heavyStroke,
    copyButtonBorderHover: 'rgba(255, 255, 255, 0.1)',

    funFeatureListBackgroundBase: DARK_THEME_COLORS.offBackground,
    funFeatureListBorderColor: DARK_THEME_COLORS.mediumStroke,
    funFeatureListBorderColorHover: 'rgba(255, 255, 255, 0.1)',
    funFeatureListBackgroundHover: DARK_THEME_COLORS.heavyStroke,

    cryptoCashToggleBackground: '#201f21',
    activeTabBackground: DARK_THEME_COLORS.mediumStroke,
    activeTabBorderColor: 'rgba(165, 168, 181, 0.1)',
    activeTabText: DARK_THEME_COLORS.primaryText,
    inactiveTabBorderColor: 'transparent',
    inactiveTabBackgroundBase: 'transparent',
    inactiveTabBackgroundHover: 'transparent',
    inactiveTabBackgroundActive: 'transparent',

    useConnectedBackgroundHover: 'rgba(255, 255, 255, 0.06)',
  },
  customShadows: {
    buttonFocusedShadow: '0px 0px 0px 3px rgba(255, 255, 255, 0.2)',
    buttonFocusedShadowTertiary: '0px 0px 0px 3px rgba(255, 255, 255, 0.15)',
  },
  customBorderRadiuses: CUSTOM_BORDER_RADII,
  customBorderWidths: {
    activeOptionBorderWidth: '2px',
    cryptoCashToggleActiveTabBorderWidth: '0px',
    cryptoCashToggleInactiveTabBorderWidth: '0px',
  },
  customSpacings: {
    cryptoCashToggleTabPaddingY: '8px',
  },
});

// Nado is dark-only, so Fun renders the same dark theme regardless of color scheme.
export const FUNKIT_THEME: ThemeSet = {
  darkTheme: NADO_FUNKIT_THEME,
  lightTheme: NADO_FUNKIT_THEME,
};
