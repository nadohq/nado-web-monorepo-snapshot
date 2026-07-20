import { NumberFormatSpecifier } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';

export interface FavoriteTicker {
  productId: number;
  marketName: string;
  priceFormatSpecifier: NumberFormatSpecifier;
  isActive: boolean;
  currentPrice: BigNumber | undefined;
  priceChangeFrac: BigNumber | undefined;
  href: string;
}
