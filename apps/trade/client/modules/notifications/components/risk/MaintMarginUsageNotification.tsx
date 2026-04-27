import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { SecondaryButton } from '@nadohq/web-ui';
import { MaintMarginUsageBar } from 'client/components/MaintMarginUsageBar';
import { Toast } from 'client/components/Toast/Toast';
import { ToastProps } from 'client/components/Toast/types';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { MaintMarginUsageNotificationData } from 'client/modules/notifications/types';
import { useTranslation } from 'react-i18next';

export interface MaintMarginUsageNotificationProps extends ToastProps {
  data: MaintMarginUsageNotificationData;
}

export function MaintMarginUsageNotification({
  data: { maintMarginUsageFraction },
  ttl,
  onDismiss,
}: MaintMarginUsageNotificationProps) {
  const { t } = useTranslation();

  const { show } = useDialog();
  const formattedMaintMarginUsageFraction = formatNumber(
    maintMarginUsageFraction,
    {
      formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_INT,
    },
  );

  const headerContent = (
    <div className="flex items-center gap-x-2">
      <span>
        {t(($) => $.maintMarginAbbrevUsageFraction, {
          usageFraction: formattedMaintMarginUsageFraction,
        })}
      </span>
      <MaintMarginUsageBar
        maintMarginUsageFraction={maintMarginUsageFraction}
        className="h-1.5 w-10 sm:h-2"
      />
    </div>
  );

  const bodyContent = (
    <>
      <p>
        {t(($) => $.maintMarginUsageReachedFraction, {
          usageFraction: formattedMaintMarginUsageFraction,
        })}
      </p>
      <SecondaryButton
        size="xs"
        onClick={() => {
          show({ type: 'deposit_options', params: {} });
          onDismiss();
        }}
        className="text-text-secondary"
      >
        {t(($) => $.buttons.depositFunds)}
      </SecondaryButton>
    </>
  );

  return (
    <Toast.Container>
      <Toast.Header onDismiss={onDismiss}>{headerContent}</Toast.Header>
      <Toast.Separator
        ttl={ttl}
        className="from-positive via-warning to-negative bg-gradient-to-r"
      />
      <Toast.Body className="flex flex-col items-start gap-y-2">
        {bodyContent}
      </Toast.Body>
    </Toast.Container>
  );
}
