import type { Address, Hex } from 'viem';

export type SignTypedDataEIP1193Parameters = [
  signerAddress: Address,
  signatureParamsJson: string,
];

export type SendTransactionEIP1193Parameters = [
  transaction: { data: Hex; from: Address; to: Address },
];
