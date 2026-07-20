import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { OrderFormTpSlPriceInputs } from 'client/modules/trading/components/OrderSettings/components/TpSlSection/OrderFormTpSlPriceInputs';
import { UseTpSlOrderForm } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';

interface Props {
  currentMarket: StaticMarketData | undefined;
  tpSlOrderForm: UseTpSlOrderForm | undefined;
  isTpSlCheckboxChecked: boolean;
}

export function TpSlSection({
  currentMarket,
  tpSlOrderForm,
  isTpSlCheckboxChecked,
}: Props) {
  if (!isTpSlCheckboxChecked || !tpSlOrderForm || !currentMarket) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-3">
      <OrderFormTpSlPriceInputs
        isTakeProfit
        priceIncrement={currentMarket?.priceIncrement}
        tpSlOrderForm={tpSlOrderForm}
      />
      <OrderFormTpSlPriceInputs
        isTakeProfit={false}
        priceIncrement={currentMarket?.priceIncrement}
        tpSlOrderForm={tpSlOrderForm}
      />
    </div>
  );
}
