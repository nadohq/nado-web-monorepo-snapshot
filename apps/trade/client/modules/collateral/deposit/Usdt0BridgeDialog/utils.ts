import { toBigInt } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import {
  INK_LZ_EID,
  USDT0_SLIPPAGE_FRACTION,
} from 'client/modules/collateral/deposit/Usdt0BridgeDialog/config';
import { Address, Hex, pad } from 'viem';

interface Params {
  amountWithDecimals: BigNumber;
  destinationAddress: Address;
}

/**
 * Builds the OFT `SendParam` struct from local data (no RPC needed).
 */
export function buildOftSendParam({
  amountWithDecimals,
  destinationAddress,
}: Params) {
  const emptyBytes: Hex = '0x';
  const minAmountWithSlippage = amountWithDecimals.times(
    1 - USDT0_SLIPPAGE_FRACTION,
  );

  return {
    dstEid: INK_LZ_EID,
    to: pad(destinationAddress, { size: 32 }),
    amountLD: toBigInt(amountWithDecimals),
    minAmountLD: toBigInt(minAmountWithSlippage),
    extraOptions: emptyBytes,
    composeMsg: emptyBytes,
    oftCmd: emptyBytes,
  };
}
