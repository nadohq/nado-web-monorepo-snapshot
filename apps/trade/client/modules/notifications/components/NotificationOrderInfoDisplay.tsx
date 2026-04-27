import { ToastLabelWithValue } from 'client/modules/notifications/components/ToastLabelWithValue';
import { useTranslation } from 'react-i18next';

interface NotificationOrderInfoDisplayProps {
  sideLabel: string;
  amount: string;
  price: string;
}

/**
 * Displays order information (price and amount) in notifications with consistent formatting
 * @param sideLabel - The label for the side (e.g. "Buy", "Sell")
 * @param amount - The formatted amount string
 * @param price - The formatted price string
 * @returns A formatted order info display component for notifications
 */
export function NotificationOrderInfoDisplay({
  sideLabel,
  amount,
  price,
}: NotificationOrderInfoDisplayProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-x-3">
      <ToastLabelWithValue label={sideLabel} value={amount} />
      <ToastLabelWithValue label={t(($) => $.price)} value={price} />
    </div>
  );
}
