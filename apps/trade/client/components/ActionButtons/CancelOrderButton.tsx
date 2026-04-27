import { BaseTestProps } from '@nadohq/web-common';
import { SecondaryButton } from '@nadohq/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { CancellableOrderWithNotificationInfo } from 'client/hooks/execute/cancelOrder/types';
import { useExecuteCancelOrdersWithNotification } from 'client/hooks/execute/cancelOrder/useExecuteCancelOrdersWithNotification';
import { useCanUserExecute } from 'client/hooks/subaccount/useCanUserExecute';
import { useTranslation } from 'react-i18next';

interface Props extends BaseTestProps {
  order: CancellableOrderWithNotificationInfo;
}

export function CancelOrderButton({ order, dataTestId }: Props) {
  const { t } = useTranslation();
  const { cancelOrdersWithNotification, status } =
    useExecuteCancelOrdersWithNotification();
  const canUserExecute = useCanUserExecute();

  const isCancelling = status === 'pending';
  // Users should be able to cancel orders even if a deposit is required
  const isDisabled = !canUserExecute || isCancelling;

  const message = (() => {
    switch (status) {
      case 'success':
        return (
          <ButtonStateContent.Success message={t(($) => $.orderCancelled)} />
        );
      case 'pending':
        return t(($) => $.cancelling);
      case 'idle':
      case 'error':
        return t(($) => $.buttons.cancel);
    }
  })();

  return (
    <SecondaryButton
      size="xs"
      title={t(($) => $.buttons.cancelOrder)}
      disabled={isDisabled}
      isLoading={isCancelling}
      onClick={() => cancelOrdersWithNotification({ orders: [order] })}
      dataTestId={dataTestId}
    >
      {message}
    </SecondaryButton>
  );
}
