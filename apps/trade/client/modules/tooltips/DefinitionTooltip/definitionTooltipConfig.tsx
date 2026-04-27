import type { I18N } from '@nadohq/i18n';

/** For simple definitions (i.e. title+content text nodes), use i18n's `definitions` scope */
export type SimpleDefinitionTooltipID = keyof Omit<
  typeof I18N.allTranslations.en.common.definitions,
  'custom'
>;

/** For complex definitions (i.e. with styling/Trans, multiple sub-keys), use inner `definitions.custom` scope */
export type CustomDefinitionTooltipID =
  keyof typeof I18N.allTranslations.en.common.definitions.custom;

export type DefinitionTooltipID =
  | SimpleDefinitionTooltipID
  | CustomDefinitionTooltipID;
