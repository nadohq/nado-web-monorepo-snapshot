import {
  CustomNumberFormatSpecifier,
  formatNumber,
} from '@nadohq/react-client';
import { AmountWithSymbol } from 'client/components/AmountWithSymbol';
import { ProductLabel } from 'client/components/ProductLabel';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { StackedValues } from 'client/modules/tables/components/StackedValues';
import { TradingSpreadTableItem } from 'client/modules/tables/spreads/useTradingSpreadsTable';
import { MobileDataTabCard } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCard';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useTranslation } from 'react-i18next';

interface Props {
  spread: TradingSpreadTableItem;
}

export function MobileTradingSpreadsCard({ spread }: Props) {
  const { t } = useTranslation();
  const {
    metadata,
    spotMetadata,
    sizeFormatSpecifier,
    spotAmount,
    perpAmount,
    spotPnlUsd,
    perpPnlUsd,
    fundingUsd,
    interestUsd,
    netPnlUsd,
  } = spread;

  return (
    <MobileDataTabCard.Container>
      <MobileDataTabCard.Header>
        <ProductLabel symbol={metadata.symbol} iconSrc={metadata.icon.asset} />
      </MobileDataTabCard.Header>
      <MobileDataTabCard.Body>
        <MobileDataTabCard.Cols2>
          <ValueWithLabel.Vertical
            sizeVariant="xs"
            label={t(($) => $.spotPerp)}
            valueContent={
              <StackedValues
                top={
                  <AmountWithSymbol
                    formattedAmount={formatNumber(spotAmount, {
                      formatSpecifier: sizeFormatSpecifier,
                    })}
                    symbol={spotMetadata.token.symbol}
                  />
                }
                bottom={
                  <AmountWithSymbol
                    formattedAmount={formatNumber(perpAmount, {
                      formatSpecifier: sizeFormatSpecifier,
                    })}
                    symbol={metadata.symbol}
                  />
                }
              />
            }
          />
          <ValueWithLabel.Vertical
            sizeVariant="xs"
            label={t(($) => $.netPnl)}
            valueClassName={getSignDependentColorClassName(netPnlUsd)}
            value={netPnlUsd}
            numberFormatSpecifier={
              CustomNumberFormatSpecifier.SIGNED_CURRENCY_2DP
            }
          />

          <ValueWithLabel.Vertical
            sizeVariant="xs"
            label={t(($) => $.spotPnl)}
            valueClassName={getSignDependentColorClassName(spotPnlUsd)}
            value={spotPnlUsd}
            numberFormatSpecifier={
              CustomNumberFormatSpecifier.SIGNED_CURRENCY_2DP
            }
          />
          <ValueWithLabel.Vertical
            sizeVariant="xs"
            label={t(($) => $.perpPnl)}
            valueClassName={getSignDependentColorClassName(perpPnlUsd)}
            value={perpPnlUsd}
            numberFormatSpecifier={
              CustomNumberFormatSpecifier.SIGNED_CURRENCY_2DP
            }
          />
          <ValueWithLabel.Vertical
            sizeVariant="xs"
            label={t(($) => $.funding)}
            valueClassName={getSignDependentColorClassName(fundingUsd)}
            value={fundingUsd}
            numberFormatSpecifier={
              CustomNumberFormatSpecifier.SIGNED_CURRENCY_2DP
            }
          />
          <ValueWithLabel.Vertical
            sizeVariant="xs"
            label={t(($) => $.interest)}
            valueClassName={getSignDependentColorClassName(interestUsd)}
            value={interestUsd}
            numberFormatSpecifier={
              CustomNumberFormatSpecifier.SIGNED_CURRENCY_2DP
            }
          />
        </MobileDataTabCard.Cols2>
      </MobileDataTabCard.Body>
    </MobileDataTabCard.Container>
  );
}
