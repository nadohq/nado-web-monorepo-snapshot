/**
 * Class names for table cell containers to set widths for specific column content types.
 * If the width is flexible (i.e. `min-w-* max-w-*`, `flex-1` will be automatically applied.
 */
export const TABLE_CELL_CONTAINER_CLASSNAME = {
  /**
   * Width for "Market" / "Asset" / "Product" columns
   */
  product: 'w-37',

  /**
   * Width for "Market" / "Asset" / "Product" columns
   * (use this when it's the first column in the table, to enable border highlight effect)
   */
  productWithHighlight: 'w-37 product-label-border-container',

  /**
   * Width for Price-related columns
   */
  price: 'min-w-30 max-w-40',

  /**
   * Width for Amount-related columns
   */
  amount: 'min-w-28 max-w-40',

  /**
   * Width for Amount-related columns that also display the symbol
   */
  amountWithSymbol: 'min-w-32 max-w-40',

  /**
   * Width for Order Value columns (filled/total format)
   */
  orderValue: 'min-w-34 max-w-40',

  /**
   * Width for Percentage-related columns
   */
  percentage: 'min-w-28 max-w-32',

  /**
   * Width for Time-related columns
   */
  time: 'w-32',

  /**
   * Width for Order Type columns
   */
  orderType: 'w-32',

  /**
   * Width for Order Side / Direction columns
   */
  orderSide: 'w-32',

  /**
   * Width for Reduce Only columns
   */
  isReduceOnly: 'w-36',

  /**
   * Width for Status-related columns
   */
  status: 'min-w-28 max-w-40',

  /**
   * Width for Username-related columns (eg. Subaccount Display Name)
   */
  username: 'min-w-32 max-w-36',

  /**
   * Width for Trigger Condition-related columns
   */
  triggerCondition: 'min-w-32 max-w-40',

  /**
   * Width for "Actions" columns, ie. the last column in the table with action buttons
   * (`ml-auto` is used to push buttons to the right edge of the cell)
   */
  actions: 'ml-auto',

  /**
   * Width for "Frequency" columns, ie. used for TWAP orders only
   */
  twapFrequency: 'min-w-24 max-w-28',

  /**
   * Width for "Runtime" columns, ie. used for TWAP orders only
   */
  twapRuntime: 'min-w-32 max-w-40',

  /**
   * Width for PnL columns that display value + percentage (and optionally a share button)
   */
  pnl: 'min-w-28 max-w-36',

  /**
   * Width for Order ID columns (with truncated ID and copy button)
   */
  orderId: 'w-20',

  /**
   * Width for TWAP executions action column, ie. used for TWAP orders only
   */
  twapExecutions: 'w-12',
};
