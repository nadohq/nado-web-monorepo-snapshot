import { Icons } from '@nadohq/web-ui';
import { Toast } from 'client/components/Toast/Toast';
import { TOAST_HEADER_ICON_SIZE } from 'client/components/Toast/consts';
import { ToastProps } from 'client/components/Toast/types';
import { ROUTES } from 'client/modules/app/consts/routes';
import { LiquidationNotificationData } from 'client/modules/notifications/types';
import { useTranslation } from 'react-i18next';

export interface LiquidationNotificationProps extends ToastProps {
  data: LiquidationNotificationData;
}

export function LiquidationNotification({
  data,
  ttl,
  onDismiss,
}: LiquidationNotificationProps) {
  const { t } = useTranslation();

  const { isSpotLiquidated, isPerpLiquidated } = data;

  // https://nado-xwn1857.slack.com/archives/C03Q7BRV7NW/p1690683988305609
  // If only spot or perp was liquidated: "Your spot balance was liquidated." / "Your perp position was liquidated."
  // If both spot & perp were liquidated: "Your spot balance and perp position were liquidated."
  const liquidationMessage = (() => {
    if (isSpotLiquidated && isPerpLiquidated) {
      return t(($) => $.notifications.spotAndPerpLiquidated);
    }
    if (isSpotLiquidated) {
      return t(($) => $.notifications.spotLiquidated);
    }
    if (isPerpLiquidated) {
      return t(($) => $.notifications.perpLiquidated);
    }
  })();

  const heading = (
    <div className="text-negative flex items-center gap-x-2">
      <Icons.Warning size={TOAST_HEADER_ICON_SIZE} />
      {t(($) => $.notifications.liquidationEvent)}
    </div>
  );

  return (
    <Toast.Container className="border-negative">
      <Toast.Header onDismiss={onDismiss}>{heading}</Toast.Header>
      <Toast.Separator ttl={ttl} className="bg-negative-muted" />
      <Toast.Body className="flex flex-col gap-y-2">
        <p>{liquidationMessage}</p>
        <Toast.FooterLink href={ROUTES.portfolio.history}>
          {t(($) => $.buttons.viewHistory)}
        </Toast.FooterLink>
      </Toast.Body>
    </Toast.Container>
  );
}
