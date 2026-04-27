import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import {
  Divider,
  IconButton,
  Icons,
  SecondaryButton,
  TextButton,
} from '@nadohq/web-ui';
import { PnlValueWithPercentage } from 'client/components/PnlValueWithPercentage';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useUserStateError } from 'client/hooks/subaccount/useUserStateError';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { DialogParams } from 'client/modules/app/dialogs/types';
import { PerpTpSlPrices } from 'client/modules/tables/cells/PerpTpSlCell/PerpTpSlPrices';
import { PerpPnlShareButton } from 'client/modules/tables/components/PerpPnlShareButton';
import { PerpPositionLabel } from 'client/modules/tables/components/PerpPositionLabel';
import { MobileDataTabCard } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCard';
import { PerpPositionsTableItem } from 'client/modules/tables/types/PerpPositionsTableItem';
import { useHandleMarketClosePosition } from 'client/modules/trading/closePosition/hooks/useHandleMarketClosePosition';
import { useTranslation } from 'react-i18next';

interface Props {
  position: PerpPositionsTableItem;
  isSingleSignatureSession: boolean;
  showDialog: (dialog: DialogParams) => void;
}

export function MobilePerpPositionsCard({
  position,
  isSingleSignatureSession,
  showDialog,
}: Props) {
  const { t } = useTranslation();

  const isoSubaccountName = position.isoSubaccountName;
  const tpSlData = position.tpSl;

  const formattedMarginUsd = formatNumber(
    position.margin.isoMarginUsedUsd
      ? position.margin.isoMarginUsedUsd
      : position.margin.crossMarginUsedUsd,
    {
      formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
    },
  );

  return (
    <MobileDataTabCard.Container>
      <MobileDataTabCard.Header className="product-label-border-container">
        <PerpPositionLabel
          productId={position.productId}
          marketName={position.productName}
          amountForSide={position.positionAmount}
          marginModeType={position.margin.marginModeType}
          isoLeverage={position.margin.isoLeverage}
        />
        <PerpPnlShareButton
          productId={position.productId}
          positionAmount={position.positionAmount}
          pnlFrac={position.pnlInfo.estimatedPnlFrac}
          pnlUsd={position.pnlInfo.estimatedPnlUsd}
          entryPrice={position.averageEntryPrice}
          referencePrice={position.estimatedExitPrice}
          referencePriceLabel={t(($) => $.currentPrice)}
          marginModeType={position.margin.marginModeType}
          isoLeverage={position.margin.isoLeverage}
        />
      </MobileDataTabCard.Header>
      <MobileDataTabCard.Body>
        <div className="flex justify-between">
          <ValueWithLabel.Vertical
            sizeVariant="sm"
            label={t(($) => $.sizeValue)}
            valueContent={
              <div className="flex flex-col gap-1.5">
                <span>
                  {formatNumber(position.positionAmount, {
                    formatSpecifier: position.formatSpecifier.size,
                  })}{' '}
                  {position.baseSymbol}
                </span>
                <span className="text-text-tertiary text-xs">
                  {formatNumber(position.notionalValueUsd, {
                    formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
                  })}
                </span>
              </div>
            }
          />
          <ValueWithLabel.Vertical
            className="items-end"
            sizeVariant="sm"
            label={t(($) => $.estimatedAbbrevPnlRoe)}
            tooltip={{
              id: 'estimatedPositionPnL',
            }}
            valueContent={
              <PnlValueWithPercentage
                className="flex flex-col items-end gap-y-1.5"
                pnlUsd={position.pnlInfo.estimatedPnlUsd}
                pnlFrac={position.pnlInfo.estimatedPnlFrac}
              />
            }
          />
        </div>
        <Divider />
        <MobileDataTabCard.Cols3>
          <ValueWithLabel.Vertical
            sizeVariant="xs"
            label={t(($) => $.entryPrice)}
            tooltip={{
              id: 'averageEntryPrice',
            }}
            value={position.averageEntryPrice}
            numberFormatSpecifier={position.formatSpecifier.price}
          />
          <ValueWithLabel.Vertical
            className="items-center"
            sizeVariant="xs"
            label={t(($) => $.oraclePrice)}
            tooltip={{ id: 'oraclePrice' }}
            value={position.oraclePrice}
            numberFormatSpecifier={position.formatSpecifier.price}
          />
          <ValueWithLabel.Vertical
            className="items-end"
            sizeVariant="xs"
            label={t(($) => $.estimatedAbbrevLiqPrice)}
            value={position.estimatedLiquidationPrice ?? undefined}
            numberFormatSpecifier={position.formatSpecifier.price}
          />
          <ValueWithLabel.Vertical
            sizeVariant="xs"
            label={t(($) => $.margin)}
            tooltip={{ id: 'perpPositionsMargin' }}
            valueContent={
              !!isoSubaccountName ? (
                <TextButton
                  colorVariant="primary"
                  onClick={() =>
                    showDialog({
                      type: 'adjust_iso_margin',
                      params: {
                        isoSubaccountName,
                      },
                    })
                  }
                  endIcon={
                    <Icons.PencilSimpleFill className="text-text-secondary" />
                  }
                >
                  {formattedMarginUsd}
                </TextButton>
              ) : (
                formattedMarginUsd
              )
            }
          />
          <ValueWithLabel.Vertical
            className="items-center"
            sizeVariant="xs"
            label={t(($) => $.funding)}
            tooltip={{ id: 'perpPositionsFundingPayments' }}
            value={position.netFunding}
            numberFormatSpecifier={
              PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP
            }
          />
          <ValueWithLabel.Vertical
            className="items-end"
            sizeVariant="xs"
            label={t(($) => $.tpSl)}
            tooltip={{ id: 'perpPositionsTpSl' }}
            valueContent={
              <TextButton
                colorVariant="primary"
                endIcon={<Icons.ArrowUpRight className="text-text-secondary" />}
                onClick={() => {
                  showDialog({
                    type: 'manage_tp_sl',
                    params: {
                      productId: position.productId,
                      isIso: !!isoSubaccountName,
                    },
                  });
                }}
                disabled={!isSingleSignatureSession}
              >
                <PerpTpSlPrices
                  className="items-end"
                  numTpSlOrders={tpSlData?.allOrders?.length ?? 0}
                  hasMultipleTpOrSlOrders={!!tpSlData?.hasMultipleTpOrSlOrders}
                  priceFormatSpecifier={position.formatSpecifier.price}
                  tpTriggerPrice={tpSlData?.tpTriggerPrice}
                  slTriggerPrice={tpSlData?.slTriggerPrice}
                />
              </TextButton>
            }
          />
        </MobileDataTabCard.Cols3>
      </MobileDataTabCard.Body>
      <MobilePositionsActionButtons
        productId={position.productId}
        isSingleSignatureSession={isSingleSignatureSession}
        isoSubaccountName={isoSubaccountName}
        hasReduceOnlyOrders={
          !!tpSlData?.slTriggerPrice || !!tpSlData?.tpTriggerPrice
        }
      />
    </MobileDataTabCard.Container>
  );
}

interface MobilePositionsActionButtonsProps {
  productId: number;
  isoSubaccountName: string | undefined;
  isSingleSignatureSession: boolean;
  hasReduceOnlyOrders: boolean;
}

function MobilePositionsActionButtons({
  productId,
  isoSubaccountName,
  isSingleSignatureSession,
  hasReduceOnlyOrders,
}: MobilePositionsActionButtonsProps) {
  const { t } = useTranslation();

  const { show } = useDialog();
  const handleMarketClosePosition = useHandleMarketClosePosition();
  const userStateError = useUserStateError();

  const tpSlButtonProps = (() => {
    if (!isSingleSignatureSession) {
      return {
        children: t(($) => $.buttons.enable1CT),
        onClick: () => show({ type: 'signature_mode_settings', params: {} }),
      };
    }

    if (userStateError === 'requires_sign_once_approval') {
      return {
        children: t(($) => $.buttons.approve1CT),
        onClick: () =>
          show({ type: 'single_signature_reapproval', params: {} }),
      };
    }

    if (hasReduceOnlyOrders) {
      return {
        children: t(($) => $.buttons.manageTpSl),
        onClick: () => {
          show({
            type: 'manage_tp_sl',
            params: { productId, isIso: !!isoSubaccountName },
          });
        },
      };
    }

    return {
      children: t(($) => $.buttons.addTpSl),
      onClick: () =>
        show({
          type: 'add_tp_sl',
          params: { productId, isIso: !!isoSubaccountName },
        }),
    };
  })();

  return (
    <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_auto] gap-x-2 px-3">
      <SecondaryButton size="sm" {...tpSlButtonProps} />
      <SecondaryButton
        size="sm"
        onClick={() =>
          handleMarketClosePosition({
            productId,
            isoSubaccountName,
          })
        }
      >
        {t(($) => $.buttons.closeMarket)}
      </SecondaryButton>
      <SecondaryButton
        size="sm"
        onClick={() =>
          show({
            type: 'close_position',
            params: { productId, isoSubaccountName, isLimitOrder: true },
          })
        }
      >
        {t(($) => $.buttons.closeLimit)}
      </SecondaryButton>
      <IconButton
        size="sm"
        icon={Icons.ArrowsDownUp}
        onClick={() =>
          show({
            type: 'reverse_position',
            params: { productId, isIso: !!isoSubaccountName },
          })
        }
      />
    </div>
  );
}
