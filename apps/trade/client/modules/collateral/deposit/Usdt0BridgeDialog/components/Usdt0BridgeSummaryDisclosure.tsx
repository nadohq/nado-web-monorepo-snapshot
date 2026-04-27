import {
  CustomNumberFormatSpecifier,
  PresetNumberFormatSpecifier,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { ActionSummary } from 'client/components/ActionSummary';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  /** Amount user will receive on destination (decimal adjusted). */
  receiveAmount: BigNumber | undefined;
  /** Transaction cost in native token (e.g. ETH), decimal adjusted. */
  transactionCost: BigNumber | undefined;
  /** Protocol fee in USDT (decimal adjusted). */
  protocolFee: BigNumber | undefined;
  /** Native currency symbol for the fee (e.g. ETH, MATIC). */
  nativeCurrencySymbol: string | undefined;
  /** Source token symbol (e.g. USDT on Ethereum, USDT0 on others). */
  sourceTokenSymbol: string | undefined;
}

/**
 * Collapsible summary for USDT0 bridge: receive amount, LayerZero fee, protocol fee.
 * Renders ActionSummary.Disclosure only; parent should wrap with ActionSummary.Container
 * and place the submit button as a sibling (same pattern as DepositSummaryDisclosure).
 */
export function Usdt0BridgeSummaryDisclosure({
  className,
  receiveAmount,
  transactionCost,
  protocolFee,
  nativeCurrencySymbol,
  sourceTokenSymbol,
}: Props) {
  const { t } = useTranslation();
  const {
    primaryQuoteToken: { symbol: primaryQuoteSymbol },
  } = useNadoMetadataContext();

  return (
    <ActionSummary.Disclosure
      className={className}
      labelContent={t(($) => $.summary)}
      expandableContent={
        <>
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.youWillReceive)}
            value={receiveAmount}
            numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
            valueEndElement={primaryQuoteSymbol}
          />
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.estArrivalTime)}
            valueContent={t(($) => $.approxOneMinute)}
          />
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.transactionCost)}
            value={transactionCost}
            numberFormatSpecifier={CustomNumberFormatSpecifier.NUMBER_AUTO}
            valueEndElement={nativeCurrencySymbol}
          />
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.protocolFee)}
            value={protocolFee}
            numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
            valueEndElement={sourceTokenSymbol}
          />
        </>
      }
    />
  );
}
