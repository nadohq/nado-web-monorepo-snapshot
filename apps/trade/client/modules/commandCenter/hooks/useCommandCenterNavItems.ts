import { IconComponent, Icons, imageToIconComponent } from '@nadohq/web-ui';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { ROUTES } from 'client/modules/app/consts/routes';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useEnabledFeatures } from 'client/modules/envSpecificContent/hooks/useEnabledFeatures';
import { IMAGES } from 'common/brandMetadata/images';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const NlpIcon = imageToIconComponent({
  src: IMAGES.nlpIcon,
  alt: 'NLP',
});

export interface NavItem {
  label: string;
  icon: IconComponent;
  action: () => void;
  actionText: string;
  searchKey: string;
  type: 'navItems';
}

export function useCommandCenterNavItems() {
  const { t } = useTranslation();
  const { show } = useDialog();
  const router = useRouter();
  const { isNotifiEnabled } = useEnabledFeatures();
  const isConnected = useIsConnected();

  const canShowDepositOrRepay = isConnected;
  const canShowTransfer = isConnected;
  const canShowWithdrawOrBorrow = isConnected;
  const canShowNlpAction = isConnected;
  const canShowSettings = isConnected;
  const canShowNotifications = isNotifiEnabled && isConnected;

  const navItems: NavItem[] = useMemo(
    () => [
      {
        label: t(($) => $.navigation.overview),
        icon: Icons.Coins,
        action: () => router.push(ROUTES.portfolio.overview),
        actionText: t(($) => $.buttons.goToPage),
        searchKey: t(($) => $.navigation.overview),
        type: 'navItems' as const,
      },
      {
        label: t(($) => $.navigation.marginManager),
        icon: Icons.Gauge,
        action: () => router.push(ROUTES.portfolio.marginManager),
        actionText: t(($) => $.buttons.goToPage),
        searchKey: t(($) => $.navigation.marginManager),
        type: 'navItems' as const,
      },
      {
        label: t(($) => $.navigation.history),
        icon: Icons.ClockClockwise,
        action: () => router.push(ROUTES.portfolio.history),
        actionText: t(($) => $.buttons.goToPage),
        searchKey: t(($) => $.navigation.history),
        type: 'navItems' as const,
      },
      ...(canShowNotifications
        ? [
            {
              label: t(($) => $.navigation.notifications),
              icon: Icons.BellSimple,
              action: () => show({ type: 'notifi_settings', params: {} }),
              actionText: t(($) => $.buttons.openDialog),
              searchKey: t(($) => $.navigation.notifications),
              type: 'navItems' as const,
            },
          ]
        : []),
      ...(canShowSettings
        ? [
            {
              label: t(($) => $.navigation.settings),
              icon: Icons.GearSix,
              action: () => show({ type: 'settings', params: {} }),
              actionText: t(($) => $.buttons.openDialog),
              searchKey: t(($) => $.navigation.settings),
              type: 'navItems' as const,
            },
          ]
        : []),
      ...(canShowDepositOrRepay
        ? [
            {
              label: t(($) => $.navigation.deposit),
              icon: Icons.ArrowDownLeft,
              action: () => show({ type: 'deposit_options', params: {} }),
              actionText: t(($) => $.buttons.openDialog),
              searchKey: t(($) => $.navigation.deposit),
              type: 'navItems' as const,
            },
            {
              label: t(($) => $.navigation.repay),
              icon: Icons.ArrowsClockwise,
              action: () => show({ type: 'repay', params: {} }),
              actionText: t(($) => $.buttons.openDialog),
              searchKey: t(($) => $.navigation.repay),
              type: 'navItems' as const,
            },
          ]
        : []),
      ...(canShowTransfer
        ? [
            {
              label: t(($) => $.navigation.transferFunds),
              icon: Icons.ArrowsLeftRight,
              action: () =>
                show({ type: 'subaccount_quote_transfer', params: {} }),
              actionText: t(($) => $.buttons.openDialog),
              searchKey: t(($) => $.navigation.transferFunds),
              type: 'navItems' as const,
            },
          ]
        : []),
      ...(canShowWithdrawOrBorrow
        ? [
            {
              label: t(($) => $.navigation.withdraw),
              icon: Icons.ArrowUpRight,
              action: () => show({ type: 'withdraw', params: {} }),
              actionText: t(($) => $.buttons.openDialog),
              searchKey: t(($) => $.navigation.withdraw),
              type: 'navItems' as const,
            },
            {
              label: t(($) => $.navigation.borrow),
              icon: Icons.ArrowsLeftRight,
              action: () => show({ type: 'borrow', params: {} }),
              actionText: t(($) => $.buttons.openDialog),
              searchKey: t(($) => $.navigation.borrow),
              type: 'navItems' as const,
            },
          ]
        : []),
      {
        label: t(($) => $.navigation.vault),
        icon: NlpIcon,
        action: () => router.push(ROUTES.vault),
        actionText: t(($) => $.buttons.goToPage),
        searchKey: t(($) => $.navigation.vault),
        type: 'navItems' as const,
      },
      ...(canShowNlpAction
        ? [
            {
              label: t(($) => $.navigation.depositNlpLiquidity),
              icon: Icons.ArrowDownLeft,
              action: () => show({ type: 'deposit_nlp_liquidity', params: {} }),
              actionText: t(($) => $.buttons.openDialog),
              searchKey: t(($) => $.navigation.depositNlpLiquidity),
              type: 'navItems' as const,
            },
            {
              label: t(($) => $.withdrawNlpLiquidity),
              icon: Icons.ArrowUpRight,
              action: () =>
                show({ type: 'withdraw_nlp_liquidity', params: {} }),
              actionText: t(($) => $.buttons.openDialog),
              searchKey: t(($) => $.withdrawNlpLiquidity),
              type: 'navItems' as const,
            },
          ]
        : []),
    ],
    [
      canShowDepositOrRepay,
      canShowTransfer,
      canShowWithdrawOrBorrow,
      canShowNotifications,
      canShowSettings,
      canShowNlpAction,
      router,
      show,
      t,
    ],
  );

  return { navItems };
}
