import { ProductEngineType } from '@nadohq/client';
import { TokenIconMetadata } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';

export interface MarketInfoCellData {
  marketName: string;
  icon: TokenIconMetadata;
  symbol: string;
  quoteSymbol: string;
  isPrimaryQuote: boolean;
  amountForSide: BigNumber;
  productType: ProductEngineType;
  sizeIncrement: BigNumber;
  priceIncrement: BigNumber;
}
