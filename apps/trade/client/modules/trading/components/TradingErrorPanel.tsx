import { ErrorPanel } from 'client/components/ErrorPanel';
import { AdvancedOrderRequireActiveOneClickTradingInfo } from 'client/modules/trading/components/AdvancedOrderRequireActiveOneClickTradingInfo';
import { OrderFormError } from 'client/modules/trading/types/orderFormTypes';

interface Props {
  formError: OrderFormError | undefined;
}

export function TradingErrorPanel({ formError }: Props) {
  const errorContent = (() => {
    switch (formError) {
      case 'advanced_order_single_signature_disabled':
        return <AdvancedOrderRequireActiveOneClickTradingInfo />;
      default:
        return null;
    }
  })();

  if (!errorContent) {
    return null;
  }

  return <ErrorPanel>{errorContent}</ErrorPanel>;
}
