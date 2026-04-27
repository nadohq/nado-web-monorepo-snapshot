import { formatNumber } from '@nadohq/react-client';
import { AmountWithSymbol } from 'client/components/AmountWithSymbol';
import { StackedAmountValue } from 'client/components/StackedAmountValue';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { PerpPositionLabel } from 'client/modules/tables/components/PerpPositionLabel';
import { SpotLiquidationLabel } from 'client/modules/tables/components/SpotLiquidationLabel';
import { useLiquidationEventsTable } from 'client/modules/tables/liquidations/LiquidationEventsTable/useLiquidationEventsTable';
import {
  LiquidatedBalance,
  LiquidatedBalanceType,
  LiquidationEventsTableItem,
} from 'client/modules/tables/liquidations/types';
import { MobileDataTabCard } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCard';
import { MobileDataTabCardDateTime } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCardDateTime';
import { MobileDataTabCards } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCards';
import { useTranslation } from 'react-i18next';

interface Props {
  pageSize: number;
  productIds?: number[];
}

/**
 * Mobile-optimized card view for displaying liquidation events.
 * Shows both perpetual position and spot balance liquidations with detailed information.
 */
export function MobileLiquidationsTab({ pageSize, productIds }: Props) {
  const { mappedData, isLoading } = useLiquidationEventsTable({
    pageSize,
    productIds,
  });

  return (
    <MobileDataTabCards
      emptyTablePlaceholderType="history_liquidations"
      isLoading={isLoading}
      hasData={!!mappedData?.length}
    >
      {mappedData?.map((liquidationEvent) => (
        <MobileLiquidationCard
          key={liquidationEvent.rowId}
          {...liquidationEvent}
        />
      ))}
    </MobileDataTabCards>
  );
}

function MobileLiquidationCard({
  spot,
  perp,
  timestampMillis,
}: LiquidationEventsTableItem) {
  return (
    <MobileDataTabCard.Container>
      {perp && (
        <>
          <MobileDataTabCard.Header className="product-label-border-container">
            <PerpPositionLabel
              productId={perp.productId}
              marketName={perp.productName}
              amountForSide={perp.amountLiquidated}
              marginModeType={perp.isIsolated ? 'isolated' : 'cross'}
            />
            <MobileDataTabCardDateTime timestampMillis={timestampMillis} />
          </MobileDataTabCard.Header>
          <MobileDataTabCard.Body>
            <MobileDataTabCard.Cols2>
              <LiquidationCardBodyItems
                balance={perp}
                liquidatedBalanceType="perp"
              />
            </MobileDataTabCard.Cols2>
          </MobileDataTabCard.Body>
        </>
      )}
      {spot && (
        <>
          <MobileDataTabCard.Header className="product-label-border-container">
            <SpotLiquidationLabel
              productId={spot.productId}
              productName={spot.productName}
              amountLiquidated={spot.amountLiquidated}
            />
            <MobileDataTabCardDateTime timestampMillis={timestampMillis} />
          </MobileDataTabCard.Header>
          <MobileDataTabCard.Body>
            <MobileDataTabCard.Cols2>
              <LiquidationCardBodyItems
                balance={spot}
                liquidatedBalanceType="spot"
              />
            </MobileDataTabCard.Cols2>
          </MobileDataTabCard.Body>
        </>
      )}
    </MobileDataTabCard.Container>
  );
}

interface LiquidationCardBodyItemsProps {
  balance: LiquidatedBalance;
  liquidatedBalanceType: LiquidatedBalanceType;
}

/** Shared card body items for liquidation cards */
function LiquidationCardBodyItems({
  balance,
  liquidatedBalanceType,
}: LiquidationCardBodyItemsProps) {
  const { t } = useTranslation();

  return (
    <>
      <ValueWithLabel.Vertical
        sizeVariant="xs"
        label={t(($) => $.type)}
        valueContent={t(($) => $.liquidatedBalanceTypes[liquidatedBalanceType])}
      />
      <ValueWithLabel.Vertical
        sizeVariant="xs"
        label={t(($) => $.liquidation)}
        valueContent={
          <StackedAmountValue
            symbol={balance.symbol}
            size={balance.amountLiquidated.abs()}
            sizeFormatSpecifier={balance.sizeFormatSpecifier}
            valueUsd={balance.liquidatedValueUsd.abs()}
          />
        }
      />
      <ValueWithLabel.Vertical
        sizeVariant="xs"
        label={t(($) => $.oraclePrice)}
        value={balance.oraclePrice}
        numberFormatSpecifier={balance.priceFormatSpecifier}
      />
      <ValueWithLabel.Vertical
        sizeVariant="xs"
        label={t(($) => $.positionChanges)}
        valueContent={
          <AmountWithSymbol
            formattedAmount={formatNumber(balance.amountLiquidated.negated(), {
              formatSpecifier: balance.signedSizeFormatSpecifier,
            })}
            symbol={balance.symbol}
          />
        }
      />
    </>
  );
}
