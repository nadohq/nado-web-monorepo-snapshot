/**
 * Disclosure keys for feature notifications
 */
export const FEATURE_NOTIFICATION_DISCLOSURE_KEYS = [
  'new_mkts_apr_23_2026',
] as const;

export type FeatureNotificationDisclosureKey =
  (typeof FEATURE_NOTIFICATION_DISCLOSURE_KEYS)[number];

/**
 * Disclosure keys for banners
 */
export const BANNER_DISCLOSURE_KEYS = [] as const;

export type BannerDisclosureKey = (typeof BANNER_DISCLOSURE_KEYS)[number];

/**
 * Disclosure keys for user info
 */
const USER_INFO_DISCLOSURE_KEYS = [
  'borrow_risk_warning',
  'edit_order_via_chart_dialog',
  'max_repay_warning',
  'repay_convert_info',
  'spot_leverage_on_risk',
  'nlp_deposit',
  'deposit_get_started',
] as const;

export const USER_DISCLOSURE_KEYS = [
  ...USER_INFO_DISCLOSURE_KEYS,
  ...FEATURE_NOTIFICATION_DISCLOSURE_KEYS,
  ...BANNER_DISCLOSURE_KEYS,
] as const;

export type UserDisclosureKey = (typeof USER_DISCLOSURE_KEYS)[number];
