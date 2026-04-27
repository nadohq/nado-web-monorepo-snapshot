import { ProductEngineType } from '@nadohq/client';
import {
  getMarketSizeFormatSpecifier,
  MarketCategory,
  TokenIconMetadata,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { usePerpPositions } from 'client/hooks/subaccount/usePerpPositions';
import { usePushTradePage } from 'client/hooks/ui/navigation/usePushTradePage';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useHandleMarketClosePosition } from 'client/modules/trading/closePosition/hooks/useHandleMarketClosePosition';
import { createRowId } from 'client/utils/createRowId';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface PositionsTableItem extends WithDataTableRowId {
  productId: number;
  marketInfo: {
    marketName: string;
    icon: TokenIconMetadata;
    amountForSide: BigNumber;
    productType: ProductEngineType;
  };
  amountInfo: {
    symbol: string;
    position: BigNumber;
    notionalValueUsd: BigNumber;
  };
  pnlInfo: {
    estimatedPnlUsd: BigNumber | undefined;
    estimatedPnlFrac: BigNumber | undefined;
  };
  marginModeType: MarginModeType;
  isoLeverage: number | null;
  sizeFormatSpecifier: string;
  searchKey: string;
  actionText: string;
  action: () => void;
  type: 'positions';
}

interface Params {
  marketCategory: MarketCategory | undefined;
}

export const useCommandCenterPositionsItems = ({ marketCategory }: Params) => {
  const { t } = useTranslation();
  const { data: perpBalances } = usePerpPositions();
  const { data: staticMarketsData } = useAllMarketsStaticData();

  const handleMarketClosePosition = useHandleMarketClosePosition();
  const pushTradePage = usePushTradePage();

  const isConnected = useIsConnected();
  const isCloseDisabled = !isConnected;

  const mappedData: PositionsTableItem[] = useMemo(() => {
    if (!perpBalances) {
      return [];
    }

    return perpBalances
      .filter((balance) => {
        const isMatchingCategory =
          marketCategory == null ||
          balance.metadata.marketCategories.has(marketCategory);
        const isNonZeroBalance = !balance.amount.isZero();

        return isMatchingCategory && isNonZeroBalance;
      })
      .map((position): PositionsTableItem => {
        const staticMarketData =
          staticMarketsData?.perpMarkets[position.productId];

        const action = (() => {
          // If close is disabled we push to the market page instead.
          if (isCloseDisabled) {
            return () => pushTradePage({ productId: position.productId });
          }

          return () =>
            handleMarketClosePosition({
              productId: position.productId,
              isoSubaccountName: position.iso?.subaccountName,
            });
        })();

        return {
          rowId: createRowId(
            position.productId,
            position.iso?.subaccountName ?? 'cross',
          ),
          marketInfo: {
            marketName: position.metadata.marketName,
            icon: position.metadata.icon,
            amountForSide: position.amount,
            productType: ProductEngineType.PERP,
          },
          amountInfo: {
            symbol: position.metadata.symbol,
            position: position.amount,
            notionalValueUsd: position.notionalValueUsd,
          },
          pnlInfo: {
            estimatedPnlUsd: position.estimatedPnlUsd,
            estimatedPnlFrac: position.estimatedPnlFrac,
          },
          sizeFormatSpecifier: getMarketSizeFormatSpecifier({
            sizeIncrement: staticMarketData?.sizeIncrement,
          }),
          marginModeType: position.iso ? 'isolated' : 'cross',
          isoLeverage: position.iso?.leverage ?? null,
          productId: position.productId,
          searchKey: position.metadata.marketName,
          // We are only using market close for perp positions since limit orders require a duplicate entry in the command center.
          actionText: isCloseDisabled
            ? t(($) => $.buttons.goToPage)
            : t(($) => $.buttons.marketClose),
          action,
          type: 'positions',
        };
      });
  }, [
    perpBalances,
    staticMarketsData?.perpMarkets,
    marketCategory,
    isCloseDisabled,
    handleMarketClosePosition,
    pushTradePage,
    t,
  ]);

  return { positions: mappedData };
};
