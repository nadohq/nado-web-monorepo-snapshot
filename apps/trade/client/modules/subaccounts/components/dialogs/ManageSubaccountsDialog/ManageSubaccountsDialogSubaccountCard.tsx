import {
  formatNumber,
  PresetNumberFormatSpecifier,
  useSubaccountContext,
} from '@nadohq/react-client';
import {
  joinClassNames,
  mergeClassNames,
  WithClassnames,
} from '@nadohq/web-common';
import {
  Button,
  getStateOverlayClassNames,
  Icons,
  Value,
} from '@nadohq/web-ui';
import { StatusIndicator } from 'client/components/StatusIndicator';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { ProfileAvatarIcon } from 'client/modules/subaccounts/components/ProfileAvatarIcon';
import { SubaccountWithMetrics } from 'client/modules/subaccounts/hooks/useAllSubaccountsWithMetrics';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  subaccount: SubaccountWithMetrics;
  isActive: boolean;
}

export function ManageSubaccountsDialogSubaccountCard({
  subaccount,
  isActive,
  className,
}: Props) {
  const { t } = useTranslation();
  const { setCurrentSubaccountName } = useSubaccountContext();
  const hoverStateOverlayClassnames = getStateOverlayClassNames();
  const { push } = useDialog();

  return (
    <div
      className={mergeClassNames(
        'bg-surface-1 text-text-primary overflow-hidden rounded-lg',
        className,
      )}
    >
      <Button
        className={joinClassNames(
          'w-full justify-between px-3 text-xs',
          'text-text-secondary hover:text-text-primary transition-colors',
          isActive ? 'bg-positive-muted' : 'bg-surface-3',
        )}
        onClick={() =>
          push({
            type: 'edit_user_profile',
            params: { subaccountName: subaccount.subaccountName },
          })
        }
        endIcon={<Icons.PencilSimpleFill size={12} className="ml-auto" />}
      >
        <div className="text-text-primary flex items-center gap-x-1 py-2">
          {isActive ? (
            <>
              <StatusIndicator sizeVariant="sm" colorVariant="positive" />
              {t(($) => $.current)}
            </>
          ) : (
            t(($) => $.subaccount)
          )}
        </div>
      </Button>
      <Button
        className={joinClassNames(
          'flex w-full flex-col items-center gap-y-1 p-3 pb-4 sm:gap-y-2',
          hoverStateOverlayClassnames,
        )}
        onClick={() => {
          if (!isActive) {
            setCurrentSubaccountName(subaccount.subaccountName);
          }
        }}
      >
        {/* `w-full` needed to truncate username. */}
        <div className="flex w-full flex-col items-center gap-y-2 text-xs sm:text-sm">
          <ProfileAvatarIcon
            avatar={subaccount.profile.avatar}
            size={40}
            subaccountName={subaccount.subaccountName}
          />
          <span className="w-full truncate">{subaccount.profile.username}</span>
        </div>
        <Value sizeVariant="lg" className="text-text-primary">
          {formatNumber(subaccount.portfolioValueUsd, {
            formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
          })}
        </Value>
      </Button>
    </div>
  );
}
