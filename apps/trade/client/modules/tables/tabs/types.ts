export interface TableTabProps {
  /** Set isMobile to true to render mobile UI */
  isMobile?: boolean;
  /** Optional list of product IDs to filter */
  productIds?: number[];
}

export interface HistoricalTableTabProps extends TableTabProps {
  pageSize: number;
  showPagination: boolean;
}
