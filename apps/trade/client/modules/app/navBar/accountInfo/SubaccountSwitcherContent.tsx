import {
  formatNumber,
  PresetNumberFormatSpecifier,
  useSubaccountContext,
} from '@nadohq/react-client';
import { Icons } from '@nadohq/web-ui';
import { SwitcherDropdownItemButton } from 'client/components/SwitcherDropdownItemButton';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { ACCOUNT_BUTTON_ICON_SIZE } from 'client/modules/app/navBar/accountInfo/consts';
import { ProfileAvatarIcon } from 'client/modules/subaccounts/components/ProfileAvatarIcon';
import { useAllSubaccountsWithMetrics } from 'client/modules/subaccounts/hooks/useAllSubaccountsWithMetrics';
import { useTranslation } from 'react-i18next';

export function SubaccountSwitcherContent() {
  const { t } = useTranslation();
  const { push } = useDialog();

  const subaccountsWithMetrics = useAllSubaccountsWithMetrics();
  const { currentSubaccount, setCurrentSubaccountName } =
    useSubaccountContext();

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-text-tertiary px-2 text-xs">
        {t(($) => $.otherAccounts)}
      </h4>
      <div className="flex flex-col gap-y-1">
        {subaccountsWithMetrics.map(
          ({ subaccountName, profile, portfolioValueUsd }) => {
            const { username, avatar } = profile;
            if (subaccountName === currentSubaccount.name) return null;

            return (
              <SwitcherDropdownItemButton
                key={subaccountName}
                className="gap-3 py-1.5"
                onClick={() => {
                  setCurrentSubaccountName(subaccountName);
                }}
                startIcon={
                  <ProfileAvatarIcon
                    avatar={avatar}
                    size={ACCOUNT_BUTTON_ICON_SIZE}
                    subaccountName={subaccountName}
                  />
                }
                label={
                  <div className="flex flex-col gap-1">
                    <div className="text-text-primary truncate text-sm">
                      {username}
                    </div>
                    <div className="text-text-tertiary text-xs empty:hidden">
                      {formatNumber(portfolioValueUsd, {
                        formatSpecifier:
                          PresetNumberFormatSpecifier.CURRENCY_2DP,
                      })}
                    </div>
                  </div>
                }
              />
            );
          },
        )}
        <SwitcherDropdownItemButton
          className="gap-3 py-1.5"
          onClick={() => push({ type: 'manage_subaccounts', params: {} })}
          startIcon={
            <div
              className="bg-surface-3 flex items-center justify-center rounded-full"
              style={{
                width: ACCOUNT_BUTTON_ICON_SIZE,
                height: ACCOUNT_BUTTON_ICON_SIZE,
              }}
            >
              <Icons.Plus size={16} />
            </div>
          }
          label={t(($) => $.buttons.addAccount)}
        />
      </div>
    </div>
  );
}
