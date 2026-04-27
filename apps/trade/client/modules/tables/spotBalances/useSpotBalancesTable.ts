import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import {
  SpotBalanceItem,
  useSpotBalances,
} from 'client/hooks/subaccount/useSpotBalances';
import { useMemo } from 'react';

interface BalanceInfo {
  symbol: string;
  amount: BigNumber;
  valueUsd: BigNumber;
}

export interface SpotBalanceTableItem
  extends SpotBalanceItem, WithDataTableRowId {
  balanceInfo: BalanceInfo;
}

interface Params {
  hideSmallBalances?: boolean;
}

export const useSpotBalancesTable = ({ hideSmallBalances }: Params) => {
  const { balances: spotBalances, ...rest } = useSpotBalances();

  const mappedData: SpotBalanceTableItem[] | undefined = useMemo(() => {
    if (!spotBalances) {
      return;
    }

    return spotBalances
      .filter((balance) => {
        if (hideSmallBalances) {
          // hide balances with value<5USD, always show borrowed amounts
          return (
            balance.valueUsd.isGreaterThanOrEqualTo(5) ||
            balance.amount.isLessThan(0)
          );
        }
        return true;
      })
      .map((balance) => {
        return {
          ...balance,
          balanceInfo: {
            amount: balance.amount,
            valueUsd: balance.valueUsd,
            symbol: balance.metadata.token.symbol,
          },
          rowId: String(balance.productId),
        };
      });
  }, [spotBalances, hideSmallBalances]);

  return {
    balances: mappedData,
    ...rest,
  };
};
