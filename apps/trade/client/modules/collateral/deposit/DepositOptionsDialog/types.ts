import { NextImageSrc } from '@nadohq/web-common';
import { SelectValueWithIdentifier } from '@nadohq/web-ui';
import { Chain } from 'viem';

export interface DepositOptionsDialogParams {
  initialProductId?: number;
}

export interface DepositSourceChainConfig {
  chain: Chain;
  icon: NextImageSrc;
}

export interface DepositSelectOption extends SelectValueWithIdentifier {
  label: string;
  icon: NextImageSrc;
}

export interface DepositAssetOption extends DepositSelectOption {
  productId: number;
}

export interface DepositChainOption extends DepositSelectOption {
  chainId: number;
}
