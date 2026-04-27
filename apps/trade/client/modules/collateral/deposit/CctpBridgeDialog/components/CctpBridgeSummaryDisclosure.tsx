import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { ActionSummary } from 'client/components/ActionSummary';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { USDC_TOKEN_INFO } from 'client/modules/collateral/deposit/CctpBridgeDialog/config';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  /** Amount user will receive on destination (decimal adjusted). */
  receiveAmount: BigNumber | undefined;
  /** Whether fast transfer is supported on the source chain. */
  useFastTransfer: boolean;
  /** Transaction cost in native currency. */
  transactionCost: BigNumber | undefined;
  /** Protocol fee in USDC. */
  protocolFee: BigNumber | undefined;
  /** Relay fee in USDC. */
  relayFee: BigNumber | undefined;
  /** Native currency symbol for the fees (e.g. ETH, MATIC). */
  nativeCurrencySymbol: string | undefined;
}

/**
 * Collapsible summary for CCTP bridge: receive amount, gas fees, protocol fee, relay fee.
 */
export function CctpBridgeSummaryDisclosure({
  className,
  receiveAmount,
  useFastTransfer,
  transactionCost,
  protocolFee,
  relayFee,
  nativeCurrencySymbol,
}: Props) {
  const { t } = useTranslation();

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
            numberFormatSpecifier={CustomNumberFormatSpecifier.NUMBER_AUTO}
            valueEndElement={USDC_TOKEN_INFO.symbol}
          />
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.estArrivalTime)}
            valueContent={
              useFastTransfer
                ? t(($) => $.approxOneMinute)
                : t(($) => $.approxFifteenMinutes)
            }
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
            numberFormatSpecifier={CustomNumberFormatSpecifier.NUMBER_AUTO}
            valueEndElement={USDC_TOKEN_INFO.symbol}
          />
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.relayFee)}
            value={relayFee}
            numberFormatSpecifier={CustomNumberFormatSpecifier.NUMBER_AUTO}
            valueEndElement={USDC_TOKEN_INFO.symbol}
          />
        </>
      }
    />
  );
}
