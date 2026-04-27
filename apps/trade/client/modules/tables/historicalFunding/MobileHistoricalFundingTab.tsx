import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { PerpPositionLabel } from 'client/modules/tables/components/PerpPositionLabel';
import { useFundingPaymentsTable } from 'client/modules/tables/historicalFunding/useFundingPaymentsTable';
import { MobileDataTabCard } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCard';
import { MobileDataTabCardDateTime } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCardDateTime';
import { MobileDataTabCards } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCards';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useTranslation } from 'react-i18next';

interface Props {
  pageSize: number;
  productIds?: number[];
}

export function MobileHistoricalFundingTab({ pageSize, productIds }: Props) {
  const { t } = useTranslation();

  const { mappedData: fundingPayments, isLoading } = useFundingPaymentsTable({
    pageSize,
    productIds,
  });

  return (
    <MobileDataTabCards
      emptyTablePlaceholderType="history_funding_payments"
      isLoading={isLoading}
      hasData={!!fundingPayments?.length}
    >
      {fundingPayments?.map((fundingPayment, key) => {
        return (
          <MobileDataTabCard.Container key={key}>
            <MobileDataTabCard.Header className="product-label-border-container">
              <PerpPositionLabel
                productId={fundingPayment.productId}
                marketName={fundingPayment.productName}
                amountForSide={fundingPayment.positionAmount}
                marginModeType={fundingPayment.marginModeType}
              />
              <MobileDataTabCardDateTime
                timestampMillis={fundingPayment.timestampMillis}
              />
            </MobileDataTabCard.Header>

            <MobileDataTabCard.Body>
              <MobileDataTabCard.Cols2>
                <ValueWithLabel.Vertical
                  sizeVariant="xs"
                  label={t(($) => $.payment)}
                  value={fundingPayment.fundingPaymentQuote}
                  valueClassName={getSignDependentColorClassName(
                    fundingPayment.fundingPaymentQuote,
                  )}
                  numberFormatSpecifier={
                    PresetNumberFormatSpecifier.CURRENCY_2DP
                  }
                />

                <ValueWithLabel.Vertical
                  sizeVariant="xs"
                  label={t(($) => $.positionSize)}
                  value={fundingPayment.positionSize}
                  valueEndElement={fundingPayment.baseSymbol}
                  numberFormatSpecifier={fundingPayment.formatSpecifier.size}
                />

                <ValueWithLabel.Vertical
                  sizeVariant="xs"
                  label={t(($) => $.fundingRate)}
                  value={fundingPayment.fundingRateFrac}
                  valueClassName={getSignDependentColorClassName(
                    fundingPayment.fundingRateFrac,
                  )}
                  numberFormatSpecifier={
                    PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_4DP
                  }
                />
              </MobileDataTabCard.Cols2>
            </MobileDataTabCard.Body>
          </MobileDataTabCard.Container>
        );
      })}
    </MobileDataTabCards>
  );
}
