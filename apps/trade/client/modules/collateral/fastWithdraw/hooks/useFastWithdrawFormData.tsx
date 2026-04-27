import { addDecimals, removeDecimals, toBigNumber } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { getStaticMarketDataForProductId } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/getStaticMarketDataForProductId';
import { SpotStaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { useQuerySubaccountFeeRates } from 'client/hooks/query/subaccount/useQuerySubaccountFeeRates';
import { useQueryAllProductsWithdrawPoolLiquidity } from 'client/hooks/query/withdrawPool/useQueryAllProductsWithdrawPoolLiquidity';
import { useQueryWithdrawPoolFeeAmount } from 'client/hooks/query/withdrawPool/useQueryWithdrawPoolFeeAmount';
import { useAreWithdrawalsProcessing } from 'client/modules/collateral/hooks/useAreWithdrawalsProcessing';
import { useMemo } from 'react';

interface Params {
  submissionIndex: string;
  productId: number;
  withdrawalSize: BigNumber;
}

export function useFastWithdrawFormData({
  productId,
  submissionIndex,
  withdrawalSize,
}: Params) {
  const { data: feeRatesData } = useQuerySubaccountFeeRates();
  const { data: withdrawPoolLiquidityData } =
    useQueryAllProductsWithdrawPoolLiquidity();
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const withdrawalsProcessingData = useAreWithdrawalsProcessing({
    submissionIndices: [submissionIndex],
  });

  const productMetadata = useMemo(() => {
    return getStaticMarketDataForProductId<SpotStaticMarketData>(
      productId,
      allMarketsStaticData,
    )?.metadata;
  }, [allMarketsStaticData, productId]);

  const { data: withdrawPoolFeeAmountData } = useQueryWithdrawPoolFeeAmount({
    productId,
    amount: addDecimals(withdrawalSize, productMetadata?.token.tokenDecimals),
  });

  const withdrawalFeeAmount = useMemo(() => {
    if (!feeRatesData || !withdrawPoolFeeAmountData) {
      return;
    }

    const decimalAdjustedNormalWithdrawalFee = removeDecimals(
      toBigNumber(feeRatesData.withdrawal[productId]),
    );

    const decimalAdjustedWithdrawPoolFeeAmount = removeDecimals(
      withdrawPoolFeeAmountData,
      productMetadata?.token.tokenDecimals,
    );

    return decimalAdjustedWithdrawPoolFeeAmount.plus(
      decimalAdjustedNormalWithdrawalFee,
    );
  }, [feeRatesData, productId, productMetadata, withdrawPoolFeeAmountData]);

  return {
    isWithdrawProcessing: withdrawalsProcessingData?.[submissionIndex],
    withdrawPoolLiquidity: removeDecimals(
      withdrawPoolLiquidityData?.[productId],
      productMetadata?.token.tokenDecimals,
    ),
    withdrawalFeeAmount,
    productMetadata,
  };
}
