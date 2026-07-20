import { TimeInSeconds } from '@nadohq/client';
import {
  CustomNumberFormatSpecifier,
  formatNumber,
  PresetNumberFormatSpecifier,
  useSubaccountContext,
} from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { Button, Icons, useIsMobile, Value } from '@nadohq/web-ui';
import { SwitcherDropdownItemButton } from 'client/components/SwitcherDropdownItemButton';
import { useSubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/useSubaccountOverview';
import { useSubaccountTimespanMetrics } from 'client/hooks/subaccount/useSubaccountTimespanMetrics';
import { ROUTES } from 'client/modules/app/consts/routes';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { ACCOUNT_BUTTON_ICON_SIZE } from 'client/modules/app/navBar/accountInfo/consts';
import { ProfileAvatarIcon } from 'client/modules/subaccounts/components/ProfileAvatarIcon';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useRouter } from 'next/navigation';

export function AccountDropdownCurrentProfileCard() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { push } = useDialog();
  const {
    currentSubaccountProfile: { avatar, username },
    currentSubaccount: { name },
  } = useSubaccountContext();

  const onViewPortfolio = () => router.push(ROUTES.portfolio.overview);

  const onEditProfile = () => {
    push({
      type: 'edit_user_profile',
      params: { subaccountName: name },
    });
  };

  const { data: subaccountOverview } = useSubaccountOverview();
  const { data: timespanMetrics } = useSubaccountTimespanMetrics(
    TimeInSeconds.DAY,
  );

  // if delta is zero, this is false so we do not show confusing "$0.00" after portfolio value
  // this makes even more sense for onboarding case (which would show "$0.00 $0.00" otherwise)
  const showPortfolioValueUsdDelta =
    timespanMetrics && !timespanMetrics.deltas.portfolioValueUsd.isZero();

  return (
    // pr-1 + the icon's p-2 align the end icon with the disconnect button above
    <SwitcherDropdownItemButton
      className="group gap-3 pr-1"
      onClick={onViewPortfolio}
      startIcon={
        <ProfileAvatarIcon avatar={avatar} size={ACCOUNT_BUTTON_ICON_SIZE} />
      }
      label={
        <div className="flex flex-col gap-y-1">
          <div className="text-text-tertiary text-xs">{username}</div>
          <Value
            endElement={
              showPortfolioValueUsdDelta &&
              formatNumber(timespanMetrics?.deltas.portfolioValueUsd, {
                formatSpecifier:
                  CustomNumberFormatSpecifier.SIGNED_CURRENCY_2DP,
              })
            }
            endElementClassName={getSignDependentColorClassName(
              timespanMetrics?.deltas.portfolioValueUsd,
            )}
          >
            {formatNumber(subaccountOverview?.portfolioValueUsd, {
              formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
            })}
          </Value>
        </div>
      }
      endIcon={
        <Button
          as="div"
          className="p-2"
          onClick={(e) => {
            e.stopPropagation();
            onEditProfile();
          }}
        >
          <Icons.PencilSimpleFill
            className={joinClassNames(
              'text-text-secondary size-3',
              isMobile ? 'block' : 'hidden group-hover:block',
            )}
          />
        </Button>
      }
    />
  );
}
