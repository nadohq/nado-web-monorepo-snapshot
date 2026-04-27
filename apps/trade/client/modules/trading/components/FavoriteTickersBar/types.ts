import { BigNumber } from 'bignumber.js';

export interface FavoriteTicker {
  productId: number;
  marketName: string;
  priceIncrement: BigNumber;
  isActive: boolean;
  currentPrice: BigNumber | undefined;
  priceChangeFrac: BigNumber | undefined;
  href: string;
}
