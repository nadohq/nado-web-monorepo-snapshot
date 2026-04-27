import { MarketWithRateList } from 'client/components/MarketWithRateList';
import { StatsSection } from 'client/components/StatsSection';
import { useEdgeLowestBorrowAprsCardData } from 'client/pages/MainPage/components/TvlAndYieldTabContent/BorrowDepositAprCardsSection/useEdgeLowestBorrowAprsCardData';
import { useEdgeTopDepositAprsCardData } from 'client/pages/MainPage/components/TvlAndYieldTabContent/BorrowDepositAprCardsSection/useEdgeTopDepositAprsCardData';

export function BorrowDepositAprCardsSection() {
  const {
    data: edgeLowestBorrowAprsCardData,
    isLoading: isLoadingEdgeLowestBorrowAprsCardData,
  } = useEdgeLowestBorrowAprsCardData();
  const {
    data: edgeTopDepositAprsCardData,
    isLoading: isLoadingEdgeTopDepositAprsCardData,
  } = useEdgeTopDepositAprsCardData();

  return (
    <StatsSection className="sm:grid-cols-2">
      <MarketWithRateList.Card
        title="Top Deposit APRs"
        description="The highest deposit APRs, calculated based on current utilization rates."
        isLoading={isLoadingEdgeTopDepositAprsCardData}
        data={edgeTopDepositAprsCardData?.topDepositAprs}
        renderListItem={({ asset, rate }) => (
          <MarketWithRateList.Item
            key={asset}
            asset={asset}
            rate={rate}
            rateClassName="text-positive"
          />
        )}
      />
      <MarketWithRateList.Card
        title="Lowest Borrow APRs"
        description="The lowest borrow APRs, calculated based on current utilization rates."
        isLoading={isLoadingEdgeLowestBorrowAprsCardData}
        data={edgeLowestBorrowAprsCardData?.lowestBorrowAprs}
        renderListItem={({ asset, rate }) => (
          <MarketWithRateList.Item
            key={asset}
            asset={asset}
            rate={rate}
            rateClassName="text-negative"
          />
        )}
      />
    </StatsSection>
  );
}
