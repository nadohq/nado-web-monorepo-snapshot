import { ProductEngineType } from '@nadohq/client';
import { NumberFormatSpecifier } from '@nadohq/react-client';

export interface ProductTableItem {
  productId: number;
  productType: ProductEngineType;
  isPerp: boolean;
  productName: string;
  baseSymbol: string;
  quoteSymbol: string;
  isPrimaryQuote: boolean;
  formatSpecifier: {
    price: NumberFormatSpecifier;
    size: NumberFormatSpecifier;
  };
}
