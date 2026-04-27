import { range } from 'lodash';
import { SUBACCOUNT_LIMIT } from '../../../consts/subaccount';
import { getAppSubaccountName } from './getAppSubaccountName';

/**
 * Subaccount names we create on the FE, including the primary subaccount name.
 * e.g. `default`, `default_1`, `default_2`, etc.
 */
const APP_SUBACCOUNT_NAMES = new Set(
  range(SUBACCOUNT_LIMIT).map((idx) => getAppSubaccountName(idx)),
);

/**
 * Determines whether the passed in name belongs to a subaccount created on the FE.
 */
export function isAppSubaccountName(subaccountName: string) {
  return APP_SUBACCOUNT_NAMES.has(subaccountName);
}
