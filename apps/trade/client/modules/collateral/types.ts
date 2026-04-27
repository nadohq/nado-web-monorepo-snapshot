import { TokenIconMetadata } from '@nadohq/react-client';
import { SelectValueWithIdentifier } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';

export interface CollateralSpotProductSelectValue extends SelectValueWithIdentifier {
  icon: TokenIconMetadata;
  symbol: string;
  productId: number;
  displayedAssetAmount: BigNumber | undefined;
  displayedAssetValueUsd: BigNumber | undefined;
  depositAPY?: BigNumber;
}
