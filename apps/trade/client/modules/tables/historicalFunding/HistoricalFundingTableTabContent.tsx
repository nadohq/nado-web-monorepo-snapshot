import { MobileHistoricalFundingTab } from 'client/modules/tables/historicalFunding/MobileHistoricalFundingTab';
import { PaginatedFundingPaymentsTable } from 'client/modules/tables/historicalFunding/PaginatedFundingPaymentsTable';
import { HistoricalTableTabProps } from 'client/modules/tables/tabs/types';

export function HistoricalFundingTableTabContent({
  pageSize,
  showPagination,
  productIds,
  isMobile,
}: HistoricalTableTabProps) {
  if (isMobile) {
    return (
      <MobileHistoricalFundingTab pageSize={pageSize} productIds={productIds} />
    );
  }

  return (
    <PaginatedFundingPaymentsTable
      pageSize={pageSize}
      productIds={productIds}
      showPagination={showPagination}
    />
  );
}
