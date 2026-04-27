export interface PrivacySettings {
  /** Whether the user's account values are private */
  areAccountValuesPrivate: boolean;
  /** Whether the user's address is private */
  isAddressPrivate: boolean;
}

export type PrivacySettingKey = keyof PrivacySettings;
