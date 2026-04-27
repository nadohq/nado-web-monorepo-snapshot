'use server';

import { I18N } from '@nadohq/i18n';
import i18n from 'common/i18n/i18n';

/**
 * getT returns a request-scoped `t` function for a given language
 *
 * @param lng Language for the returned `t` function (default: fallbackLng)
 * @param ns Default namespace for the returned `t` function (default: defaultNs)
 * @returns {t: TFunction}
 */
export async function getT(
  lng: string = I18N.fallbackLng,
  ns: string = I18N.defaultNs,
) {
  return { t: i18n.getFixedT([lng, ns]) };
}
