import { QUOTE_PRODUCT_ID, SubaccountTx } from '@nadohq/client';
import {
  CustomNumberFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { Divider } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ActionSummary } from 'client/components/ActionSummary';
import { ValueWithLabelProps } from 'client/components/ValueWithLabel/types';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useCollateralEstimateSubaccountInfoChange } from 'client/modules/collateral/hooks/useCollateralEstimateSubaccountInfoChange';
import { QuoteTransferSubaccount } from 'client/modules/subaccounts/hooks/useSubaccountQuoteTransferForm/useSubaccountQuoteTransferFormData';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  senderSubaccount: QuoteTransferSubaccount;
  recipientSubaccount: QuoteTransferSubaccount;
  senderEstimateStateTxs: SubaccountTx[];
  recipientEstimateStateTxs: SubaccountTx[];
  senderQuoteBalanceDelta: BigNumber | undefined;
  recipientQuoteBalanceDelta: BigNumber | undefined;
  symbol: string;
}

export function SubaccountQuoteTransferSummaryDisclosure({
  className,
  senderSubaccount,
  recipientSubaccount,
  senderEstimateStateTxs,
  recipientEstimateStateTxs,
  senderQuoteBalanceDelta,
  recipientQuoteBalanceDelta,
  symbol,
}: Props) {
  const { t } = useTranslation();

  const content = (
    <>
      <SummarySection
        subaccount={senderSubaccount}
        estimateStateTxs={senderEstimateStateTxs}
        quoteBalanceDelta={senderQuoteBalanceDelta}
        symbol={symbol}
      />
      <Divider />
      <SummarySection
        subaccount={recipientSubaccount}
        estimateStateTxs={recipientEstimateStateTxs}
        quoteBalanceDelta={recipientQuoteBalanceDelta}
        symbol={symbol}
      />
    </>
  );

  return (
    <ActionSummary.Disclosure
      className={className}
      expandableContent={content}
      labelContent={t(($) => $.summary)}
    />
  );
}

interface SummarySectionParams {
  subaccount: QuoteTransferSubaccount;
  estimateStateTxs: SubaccountTx[];
  quoteBalanceDelta: BigNumber | undefined;
  symbol: string;
}

function SummarySection({
  subaccount,
  estimateStateTxs,
  quoteBalanceDelta,
  symbol,
}: SummarySectionParams) {
  const { t } = useTranslation();
  const { subaccountName, profile } = subaccount;

  const { current, estimated } = useCollateralEstimateSubaccountInfoChange({
    productId: QUOTE_PRODUCT_ID,
    estimateStateTxs,
    subaccountName,
  });

  const metricItems: ValueWithLabelProps[] = useMemo(() => {
    return [
      {
        label: t(($) => $.marginUsage),
        value: current?.marginUsageBounded,
        newValue: estimated?.marginUsageBounded,
        numberFormatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
      },
      {
        label: t(($) => $.maintMarginUsage),
        value: current?.maintMarginUsageBounded,
        newValue: estimated?.maintMarginUsageBounded,
        numberFormatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
      },
    ];
  }, [current, estimated, t]);

  return (
    <>
      <p className="text-xs">{profile.username}</p>
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.balanceChange)}
        value={quoteBalanceDelta}
        numberFormatSpecifier={CustomNumberFormatSpecifier.SIGNED_NUMBER_AUTO}
        valueEndElement={symbol}
      />
      {metricItems.map((props, index) => (
        <ValueWithLabel.Horizontal key={index} sizeVariant="xs" {...props} />
      ))}
    </>
  );
}
