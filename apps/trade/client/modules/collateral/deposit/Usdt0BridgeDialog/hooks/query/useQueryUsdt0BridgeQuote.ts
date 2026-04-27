import { addDecimals, toBigNumber } from '@nadohq/client';
import { createQueryKey, QueryDisabledError } from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { oftAbi } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/abi';
import {
  getUsdt0SourceChainConfig,
  USDT0_DECIMALS,
  Usdt0SourceChainId,
} from 'client/modules/collateral/deposit/Usdt0BridgeDialog/config';
import { buildOftSendParam } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/utils';
import { Address } from 'viem';
import { usePublicClient } from 'wagmi';

/**
 * Creates a query key for USDT0 fee quote queries.
 */
export function usdt0BridgeQuoteQueryKey(
  sourceChainId?: Usdt0SourceChainId,
  amount?: BigNumber,
  recipientAddress?: string,
) {
  return createQueryKey(
    'usdt0BridgeQuote',
    sourceChainId,
    amount?.toString(),
    recipientAddress?.toLowerCase(),
  );
}

interface Params {
  /** Source chain ID for the bridge. */
  sourceChainId: Usdt0SourceChainId;
  /** Amount to bridge. */
  amount: BigNumber | undefined;
  /** Destination address on Ink. */
  recipientAddress: Address;
}

/**
 * Query hook to fetch USDT0 bridge fee quote from LayerZero.
 * Returns messaging fees, transfer limits, and prepared send parameters.
 */
export function useQueryUsdt0BridgeQuote({
  sourceChainId,
  amount,
  recipientAddress,
}: Params) {
  const sourceConfig = getUsdt0SourceChainConfig(sourceChainId);
  const publicClient = usePublicClient({ chainId: sourceConfig.viemChain.id });

  const disabled = !amount || !recipientAddress || !publicClient;

  return useQuery({
    queryKey: usdt0BridgeQuoteQueryKey(sourceChainId, amount, recipientAddress),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const amountWithDecimals = addDecimals(amount, USDT0_DECIMALS);

      const sendParam = buildOftSendParam({
        amountWithDecimals,
        destinationAddress: recipientAddress,
      });

      // Batch quoteSend + quoteOFT in a single multicall for
      // consistent results and fewer RPC round-trips.
      const [messagingFee, [oftLimit, oftFeeDetails, oftReceipt]] =
        await publicClient.multicall({
          contracts: [
            {
              address: sourceConfig.oftAddress,
              abi: oftAbi,
              functionName: 'quoteSend',
              args: [sendParam, false],
            },
            {
              address: sourceConfig.oftAddress,
              abi: oftAbi,
              functionName: 'quoteOFT',
              args: [sendParam],
            },
          ],
          allowFailure: false,
        });

      return {
        messagingFee: {
          nativeFee: toBigNumber(messagingFee.nativeFee),
          lzTokenFee: toBigNumber(messagingFee.lzTokenFee),
        },
        feeDetails: oftFeeDetails.map((detail) => ({
          feeAmount: toBigNumber(detail.feeAmountLD),
          description: detail.description,
        })),
        receiveAmount: toBigNumber(oftReceipt.amountReceivedLD),
        sendAmount: toBigNumber(oftReceipt.amountSentLD),
        minAmount: toBigNumber(oftLimit.minAmountLD),
        maxAmount: toBigNumber(oftLimit.maxAmountLD),
      };
    },
    enabled: !disabled,
  });
}
