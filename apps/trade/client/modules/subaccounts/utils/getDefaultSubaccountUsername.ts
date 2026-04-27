import { PRIMARY_SUBACCOUNT_NAME } from '@nadohq/react-client';
import type { TFunction } from 'i18next';

export function getDefaultSubaccountUsername(
  subaccountName: string,
  t: TFunction,
) {
  if (subaccountName === PRIMARY_SUBACCOUNT_NAME) {
    return t(($) => $.defaultPrimarySubaccountUsername);
  }

  // Match FE-created subaccount names with pattern "default_x"
  const match = subaccountName.match(/^default_(\d+)$/);

  if (match) {
    const id = match[1];
    return t(($) => $.defaultSubaccountUsernameN, {
      count: parseInt(id) + 1,
    });
  }

  return subaccountName;
}
