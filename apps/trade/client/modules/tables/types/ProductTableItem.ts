import { ProductEngineType } from '@nadohq/client';

export interface ProductTableItem {
  productId: number;
  productType: ProductEngineType;
  isPerp: boolean;
  productName: string;
  baseSymbol: string;
  quoteSymbol: string;
  isPrimaryQuote: boolean;
  formatSpecifier: {
    price: string;
    size: string;
  };
}
