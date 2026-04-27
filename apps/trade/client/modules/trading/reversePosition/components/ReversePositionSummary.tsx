import {
  formatNumber,
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { Icons, TextButton } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useTranslation } from 'react-i18next';

interface ReversePositionSummaryProps {
  orderAmount: BigNumber;
  midPrice: BigNumber | undefined;
  maxSlippageFraction: number;
  priceIncrement: BigNumber | undefined;
  sizeIncrement: BigNumber | undefined;
}

export function ReversePositionSummary({
  orderAmount,
  midPrice,
  maxSlippageFraction,
  priceIncrement,
  sizeIncrement,
}: ReversePositionSummaryProps) {
  const { t } = useTranslation();

  const { push } = useDialog();
  const priceFormatSpecifier = getMarketPriceFormatSpecifier(priceIncrement);
  const sizeFormatSpecifier = getMarketSizeFormatSpecifier({
    sizeIncrement,
  });

  return (
    <div className="flex flex-col gap-y-3">
      <ValueWithLabel.Horizontal
        label={t(($) => $.orderType)}
        dataTestId="reverse-position-dialog-order-type"
        valueContent={t(($) => $.market)}
        sizeVariant="sm"
      />
      <ValueWithLabel.Horizontal
        label={t(($) => $.size)}
        value={orderAmount.abs()}
        numberFormatSpecifier={sizeFormatSpecifier}
        sizeVariant="sm"
        dataTestId="reverse-position-dialog-size"
      />
      <ValueWithLabel.Horizontal
        label={t(($) => $.midPrice)}
        value={midPrice}
        numberFormatSpecifier={priceFormatSpecifier}
        sizeVariant="sm"
        dataTestId="reverse-position-dialog-mid-price"
      />
      <ValueWithLabel.Horizontal
        label={t(($) => $.slippage)}
        valueContent={
          <TextButton
            className="gap-x-0.5"
            onClick={() => push({ type: 'settings', params: {} })}
            colorVariant="primary"
            endIcon={<Icons.NotePencil />}
          >
            {t(($) => $.maxSlippage, {
              maxSlippage: formatNumber(maxSlippageFraction, {
                formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
              }),
            })}
          </TextButton>
        }
        sizeVariant="sm"
        dataTestId="reverse-position-dialog-slippage"
      />
    </div>
  );
}
