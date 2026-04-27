import {
  CustomNumberFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { useCopyText } from '@nadohq/web-common';
import {
  formatTimestamp,
  Spinner,
  TextButton,
  TimeFormatSpecifier,
} from '@nadohq/web-ui';
import * as Accordion from '@radix-ui/react-accordion';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { PreLiquidationBalanceAccordionItem } from 'client/modules/tables/detailDialogs/PreLiquidationDetailsDialog/PreLiquidationBalanceAccordionItem';
import { PreLiquidationDetailsDialogParams } from 'client/modules/tables/detailDialogs/PreLiquidationDetailsDialog/types';
import { usePreLiquidationDetailsDialog } from 'client/modules/tables/detailDialogs/PreLiquidationDetailsDialog/usePreLiquidationDetailsDialog';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export function PreLiquidationDetailsDialog(
  params: PreLiquidationDetailsDialogParams,
) {
  const { t } = useTranslation();

  const [openAccordionIds, setOpenAccordionIds] = useState<string[]>([]);
  const { hide } = useDialog();
  const { isLoading, isError, perpBalances, spotBalances, rawJsonData } =
    usePreLiquidationDetailsDialog(params);
  const { copy, isCopied } = useCopyText();

  const noDataContent = (() => {
    if (isLoading) {
      return <Spinner className="w-10" />;
    }
    if (isError) {
      return (
        <span className="text-text-primary">
          {t(($) => $.errors.errorLoadingData)}
        </span>
      );
    }
  })();

  const onCopyJsonClick = () => {
    copy(rawJsonData);
  };

  const copyJsonButtonText = isCopied
    ? t(($) => $.buttons.copied)
    : t(($) => $.buttons.copy);

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.preLiquidationBalances)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <div className="flex flex-col items-start gap-y-2 text-xs">
          <p>
            <Trans
              i18nKey={($) => $.preLiquidationBalancesSnapshotNotice}
              values={{
                liquidationTime: formatTimestamp(
                  params.liquidationTimestampMillis,
                  {
                    formatSpecifier: TimeFormatSpecifier.MMM_D_HH_12H_O,
                  },
                ),
              }}
            />
          </p>
          <p>
            {t(($) => $.preLiquidationBalancesIfAskedBySupport)}{' '}
            <TextButton colorVariant="secondary" onClick={onCopyJsonClick}>
              {copyJsonButtonText}
            </TextButton>
          </p>
        </div>
        {/*Loading / Error states*/}
        {noDataContent && (
          <div className="flex h-40 items-center justify-center">
            {noDataContent}
          </div>
        )}
        {/*Balances*/}
        <Accordion.Root
          type="multiple"
          className="flex flex-col gap-y-2"
          value={openAccordionIds}
          onValueChange={setOpenAccordionIds}
        >
          {/*Spot balances*/}
          {spotBalances?.map((balance) => {
            const isolatedPerpProduct = balance.isolatedPerpProduct;
            const accordionId = `${balance.productId}_${isolatedPerpProduct?.productId}`;
            const isPositiveBalance = balance.balanceAmount.gt(0);
            const productNameWithMarginMode = getProductNameWithMarginMode(
              t,
              balance.productName,
              balance.marginModeType,
            );

            const metrics = (
              <>
                <ValueWithLabel.Horizontal
                  sizeVariant="xs"
                  label={t(($) => $.type)}
                  valueClassName="capitalize"
                  valueContent={t(($) => $[balance.marginModeType])}
                />
                {isolatedPerpProduct && (
                  <ValueWithLabel.Horizontal
                    sizeVariant="xs"
                    label={t(($) => $.position)}
                    valueContent={
                      balance.isolatedPerpProduct?.metadata.marketName
                    }
                  />
                )}
                <ValueWithLabel.Horizontal
                  sizeVariant="xs"
                  label={t(($) => $.oraclePrice)}
                  numberFormatSpecifier={balance.priceFormatSpecifier}
                  value={balance.oraclePrice}
                />
                <ValueWithLabel.Horizontal
                  sizeVariant="xs"
                  label={t(($) => $.balance)}
                  numberFormatSpecifier={
                    CustomNumberFormatSpecifier.NUMBER_PRECISE
                  }
                  value={balance.balanceAmount}
                  valueEndElement={balance.symbol}
                />
                <ValueWithLabel.Horizontal
                  sizeVariant="xs"
                  label={t(($) => $.value)}
                  numberFormatSpecifier={
                    PresetNumberFormatSpecifier.CURRENCY_2DP
                  }
                  value={balance.balanceValueUsd}
                />
                <ValueWithLabel.Horizontal
                  sizeVariant="xs"
                  label={t(($) => $.maintenanceWeightAbbrev)}
                  valueContent={balance.maintenanceWeight.toString()}
                />
              </>
            );

            return (
              <PreLiquidationBalanceAccordionItem
                key={accordionId}
                value={accordionId}
                active={openAccordionIds.includes(accordionId)}
                productIconSrc={balance.iconSrc}
                productName={productNameWithMarginMode}
                sideLabel={
                  isPositiveBalance ? t(($) => $.deposit) : t(($) => $.borrow)
                }
                isPositiveBalance={isPositiveBalance}
                metrics={metrics}
              />
            );
          })}
          {/*Perp positions*/}
          {perpBalances?.map((balance) => {
            const accordionId = `${balance.marginModeType}_${balance.productId}`;
            const isPositiveBalance = balance.balanceAmount.gt(0);
            const productNameWithMarginMode = getProductNameWithMarginMode(
              t,
              balance.productName,
              balance.marginModeType,
            );

            const metrics = (
              <>
                <ValueWithLabel.Horizontal
                  sizeVariant="xs"
                  label={t(($) => $.type)}
                  valueClassName="capitalize"
                  valueContent={t(($) => $[balance.marginModeType])}
                />
                <ValueWithLabel.Horizontal
                  sizeVariant="xs"
                  label={t(($) => $.oraclePrice)}
                  numberFormatSpecifier={balance.priceFormatSpecifier}
                  value={balance.oraclePrice}
                />
                <ValueWithLabel.Horizontal
                  sizeVariant="xs"
                  label={t(($) => $.balance)}
                  numberFormatSpecifier={balance.sizeFormatSpecifier}
                  value={balance.balanceAmount}
                  valueEndElement={balance.symbol}
                />
                <ValueWithLabel.Horizontal
                  sizeVariant="xs"
                  label={t(($) => $.maintenanceWeightAbbrev)}
                  valueContent={balance.maintenanceWeight.toString()}
                />
                <ValueWithLabel.Horizontal
                  sizeVariant="xs"
                  label={t(($) => $.unsettledEntryCostVQuote)}
                  numberFormatSpecifier={
                    PresetNumberFormatSpecifier.CURRENCY_2DP
                  }
                  value={balance.vQuoteBalance}
                />
              </>
            );

            return (
              <PreLiquidationBalanceAccordionItem
                key={accordionId}
                value={accordionId}
                active={openAccordionIds.includes(accordionId)}
                productIconSrc={balance.iconSrc}
                productName={productNameWithMarginMode}
                sideLabel={
                  isPositiveBalance ? t(($) => $.long) : t(($) => $.short)
                }
                isPositiveBalance={isPositiveBalance}
                metrics={metrics}
              />
            );
          })}
        </Accordion.Root>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}

function getProductNameWithMarginMode(
  t: TFunction,
  productName: string,
  marginModeType: MarginModeType,
) {
  return `${productName} (${marginModeType === 'isolated' ? t(($) => $.isolatedAbbrev) : t(($) => $.cross)})`;
}
