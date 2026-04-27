import { QUOTE_PRODUCT_ID, removeDecimals } from '@nadohq/client';
import {
  SEQUENCER_FEE_AMOUNT_USDT,
  SubaccountProfile,
  useNadoMetadataContext,
  useSubaccountContext,
  useSubaccountNames,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { AnnotatedSubaccountSummary } from 'client/hooks/query/subaccount/subaccountSummary/annotateSubaccountSummary';
import { useQuerySubaccountSummary } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySubaccountSummary';
import { useQueryMaxWithdrawableAmount } from 'client/hooks/query/subaccount/useQueryMaxWithdrawableAmount';
import { useSubaccountSigningPreferenceForSubaccount } from 'client/modules/singleSignatureSessions/hooks/useSubaccountSigningPreferenceForSubaccount';
import { useMemo } from 'react';

export interface QuoteTransferSubaccount {
  subaccountName: string;
  profile: SubaccountProfile;
  decimalAdjustedQuoteProductBalance: BigNumber | undefined;
}

interface Params {
  senderSubaccountName: string;
  recipientSubaccountName: string;
  enableBorrows: boolean;
}

export function useSubaccountQuoteTransferFormData({
  senderSubaccountName,
  recipientSubaccountName,
  enableBorrows,
}: Params) {
  const { currentSubaccount, getSubaccountProfile } = useSubaccountContext();
  const { all: fetchedSubaccountNames } = useSubaccountNames();

  const { data: maxWithdrawable } = useQueryMaxWithdrawableAmount({
    subaccountName: senderSubaccountName,
    spotLeverage: enableBorrows,
  });

  const { data: senderSubaccountSummary } = useQuerySubaccountSummary({
    subaccountName: senderSubaccountName,
  });

  const { data: recipientSubaccountSummary } = useQuerySubaccountSummary({
    subaccountName: recipientSubaccountName,
  });

  const subaccounts: QuoteTransferSubaccount[] = useMemo(() => {
    return Array.from(
      // If we're adding a new subaccount it will be set as the current subaccount but won't be
      // included in the fetched subaccount names, so we ensure that it's always includes here.
      new Set(fetchedSubaccountNames).add(currentSubaccount.name),
    ).map((subaccountName) => ({
      subaccountName,
      profile: getSubaccountProfile(subaccountName),
      decimalAdjustedQuoteProductBalance: undefined,
    }));
  }, [currentSubaccount.name, fetchedSubaccountNames, getSubaccountProfile]);

  const senderSubaccount: QuoteTransferSubaccount = useMemo(() => {
    return getQuoteTransferSubaccount(
      senderSubaccountName,
      senderSubaccountSummary,
      getSubaccountProfile,
    );
  }, [senderSubaccountName, senderSubaccountSummary, getSubaccountProfile]);

  const recipientSubaccount: QuoteTransferSubaccount = useMemo(() => {
    return getQuoteTransferSubaccount(
      recipientSubaccountName,
      recipientSubaccountSummary,
      getSubaccountProfile,
    );
  }, [
    recipientSubaccountName,
    recipientSubaccountSummary,
    getSubaccountProfile,
  ]);

  // BE returns max withdrawable exclusive of the transfer fee.
  // The FE input amount is inclusive of the fee, so we need to add the fee to the backend data.
  const decimalAdjustedMaxWithdrawableWithFee = (() => {
    if (!maxWithdrawable) {
      return;
    }

    if (maxWithdrawable.isZero()) {
      return maxWithdrawable;
    }

    return removeDecimals(maxWithdrawable).plus(SEQUENCER_FEE_AMOUNT_USDT);
  })();

  const senderSigningPreference =
    useSubaccountSigningPreferenceForSubaccount(senderSubaccountName);

  const { primaryQuoteToken } = useNadoMetadataContext();

  return {
    subaccounts,
    senderSubaccount,
    recipientSubaccount,
    decimalAdjustedMaxWithdrawableWithFee,
    senderSigningPreference,
    primaryQuoteToken,
  };
}

function getQuoteTransferSubaccount(
  subaccountName: string,
  subaccountSummary: AnnotatedSubaccountSummary | undefined,
  getSubaccountProfile: (subaccount: string) => SubaccountProfile,
): QuoteTransferSubaccount {
  const quoteProductBalance = subaccountSummary?.balances.find(
    (balance) => balance.productId === QUOTE_PRODUCT_ID,
  )?.amount;

  const decimalAdjustedQuoteProductBalance =
    removeDecimals(quoteProductBalance);

  return {
    subaccountName,
    profile: getSubaccountProfile(subaccountName),
    decimalAdjustedQuoteProductBalance,
  };
}
