import {
  GetOrderTypeLabelParams,
  getOrderTypeLabel,
} from 'client/modules/trading/utils/getOrderTypeLabel';
import { useTranslation } from 'react-i18next';

type OrderTypeLabelProps = Omit<GetOrderTypeLabelParams, 't'>;

export function OrderTypeLabel(params: OrderTypeLabelProps) {
  const { t } = useTranslation();

  return getOrderTypeLabel({ ...params, t });
}
