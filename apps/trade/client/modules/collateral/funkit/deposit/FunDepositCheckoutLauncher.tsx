import { useFunkitCheckout } from '@funkit/connect';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useQueryDirectDepositAddress } from 'client/hooks/query/collateral/useQueryDirectDepositAddress';
import { useRequiresInitialDeposit } from 'client/hooks/subaccount/useRequiresInitialDeposit';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { buildDepositCheckoutConfig } from 'client/modules/collateral/funkit/deposit/funDepositConfig';
import { useShowClassicDepositUiNotification } from 'client/modules/notifications/emitters/hooks/useShowClassicDepositUiNotification';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface FunDepositCheckoutLauncherProps {
  /** Pre-selected product. `undefined` for the "just open Deposit" entry points. */
  initialProductId: number | undefined;
}

/**
 * No-render bridge from Nado's deposit dialog to Fun's Checkout SDK: opens Fun's
 * modal exactly once and `goBack()`s only when the user explicitly closes Fun's modal.
 */
export function FunDepositCheckoutLauncher({
  initialProductId,
}: FunDepositCheckoutLauncherProps) {
  const { goBack } = useDialog();
  const { t } = useTranslation();

  useShowClassicDepositUiNotification();

  const { beginCheckout } = useFunkitCheckout({ onClose: goBack });

  const { data: staticMarketData } = useAllMarketsStaticData();
  const { data: directDepositAddress } = useQueryDirectDepositAddress();
  const requiresInitialDeposit = useRequiresInitialDeposit();

  const checkoutConfig = useMemo(
    () =>
      buildDepositCheckoutConfig({
        initialProductId,
        staticMarketData,
        modalTitle: t(($) => $.dialogTitles.deposit),
        directDepositAddress,
        requiresInitialDeposit,
      }),
    [
      directDepositAddress,
      initialProductId,
      requiresInitialDeposit,
      staticMarketData,
      t,
    ],
  );

  // Opens Fun's modal once on mount
  const hasBegunRef = useRef(false);
  useEffect(() => {
    if (hasBegunRef.current) return;
    if (!checkoutConfig) return;
    hasBegunRef.current = true;
    beginCheckout(checkoutConfig);
  }, [beginCheckout, checkoutConfig]);

  return null;
}
