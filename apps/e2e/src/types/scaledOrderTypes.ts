export enum ScaledOrderPriceDistribution {
  Flat = 'flat',
  Increasing = 'increasing',
  Decreasing = 'decreasing',
}

export enum ScaledOrderSizeDistribution {
  Evenly = 'evenly-split',
  Increasing = 'increasing',
  Decreasing = 'decreasing',
}

export interface ScaledOrderPreviewOrder {
  orderPrice: string;
  orderRatio: string;
  orderSize: string;
}

export interface ScaledOrderPreviewSetup {
  orderQuantity: string;
  totalSize: string;
  priceRange: string;
  avgEntryPrice: string;
}
