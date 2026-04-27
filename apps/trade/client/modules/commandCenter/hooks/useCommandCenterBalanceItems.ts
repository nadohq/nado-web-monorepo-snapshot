import { removeDecimals } from '@nadohq/client';
import {
  MarketCategory,
  signDependentValue,
  SpotProductMetadata,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useQueryAllDepositableTokenBalances } from 'client/hooks/query/subaccount/useQueryAllDepositableTokenBalances';
import { useSpotBalances } from 'client/hooks/subaccount/useSpotBalances';
import { useShowDialogForProduct } from 'client/hooks/ui/navigation/useShowDialogForProduct';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { CollateralDialogType } from 'client/modules/app/dialogs/types';
import { createRowId } from 'client/utils/createRowId';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface BalanceTableItem extends WithDataTableRowId {
  metadata: SpotProductMetadata;
  productId: number;
  amount: BigNumber;
  walletAmount: BigNumber | undefined;
  actionText: string;
  action: () => void;
  searchKey: string;
  type: 'balances';
}

interface Params {
  marketCategory: MarketCategory | undefined;
}

export const useCommandCenterBalanceItems = ({ marketCategory }: Params) => {
  const { t } = useTranslation();
  const { balances: spotBalances } = useSpotBalances();
  const { data: depositableTokenBalances } =
    useQueryAllDepositableTokenBalances();
  const showDialogForProduct = useShowDialogForProduct();
  const isConnected = useIsConnected();

  const mappedData: BalanceTableItem[] = useMemo(() => {
    if (!spotBalances) {
      return [];
    }

    const isDepositOrRepayDisabled = !isConnected;
    const isWithdrawOrBorrowDisabled = !isConnected;

    return spotBalances
      .filter((balance) => {
        return (
          marketCategory === undefined ||
          balance.metadata.marketCategories.has(marketCategory)
        );
      })
      .flatMap((balance) => {
        const walletAmount = removeDecimals(
          depositableTokenBalances?.[balance.productId],
          balance.metadata.token.tokenDecimals,
        );

        const { metadata, productId, amount } = balance;
        const balanceData = {
          metadata,
          productId,
          amount,
          walletAmount,
          type: 'balances' as const,
        };

        const balanceDataToReturn: BalanceTableItem[] = [];

        const dialogTypes: CollateralDialogType[] = signDependentValue(amount, {
          positive: ['deposit_options', 'borrow', 'withdraw'],
          negative: ['deposit_options', 'borrow', 'repay'],
          zero: ['deposit_options', 'borrow'],
        });

        dialogTypes.forEach((dialogType) => {
          const actionText = {
            deposit_options: t(($) => $.buttons.deposit),
            borrow: t(($) => $.buttons.borrow),
            repay: t(($) => $.buttons.repay),
            withdraw: t(($) => $.buttons.withdraw),
          }[dialogType];

          const isDepositOrRepay = ['deposit_options', 'repay'].includes(
            dialogType,
          );
          const isWithdrawOrBorrow = ['withdraw', 'borrow'].includes(
            dialogType,
          );

          if (
            (isDepositOrRepay && isDepositOrRepayDisabled) ||
            (isWithdrawOrBorrow && isWithdrawOrBorrowDisabled)
          ) {
            return;
          }

          balanceDataToReturn.push({
            ...balanceData,
            rowId: createRowId(productId, dialogType),
            actionText,
            action: () => showDialogForProduct({ dialogType, productId }),
            searchKey: `${balance.metadata.token.symbol}-${dialogType}`,
          });
        });

        return balanceDataToReturn;
      });
  }, [
    spotBalances,
    isConnected,
    marketCategory,
    depositableTokenBalances,
    showDialogForProduct,
    t,
  ]);

  return { balances: mappedData };
};
