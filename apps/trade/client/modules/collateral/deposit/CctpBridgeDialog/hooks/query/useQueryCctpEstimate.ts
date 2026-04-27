import { BigNumbers, sumBigNumberBy, toBigNumber } from '@nadohq/client';
import { createQueryKey, QueryDisabledError } from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { CCTP_BRIDGE_KIT } from 'client/modules/collateral/deposit/CctpBridgeDialog/bridgeKit';
import {
  CCTP_DESTINATION_SDK_CHAIN_NAME,
  CctpSourceChainId,
  getCctpChainConfig,
} from 'client/modules/collateral/deposit/CctpBridgeDialog/config';
import { useQueryCctpBridgeAdapter } from 'client/modules/collateral/deposit/CctpBridgeDialog/hooks/query/useQueryCctpBridgeAdapter';
import { Address } from 'viem';

/**
 * Creates a query key for CCTP fee estimation.
 *
 * @param sourceChainId - Source chain ID for the bridge.
 * @param amount - Amount to bridge.
 * @param destinationAddress - Destination address on Ink.
 * @returns Query key array.
 */
export function cctpEstimateQueryKey(
  sourceChainId?: CctpSourceChainId,
  amount?: BigNumber,
  destinationAddress?: string,
) {
  return createQueryKey(
    'cctpEstimate',
    sourceChainId,
    amount?.toString(),
    destinationAddress?.toLowerCase(),
  );
}

interface Params {
  /** Source chain ID. */
  sourceChainId: CctpSourceChainId;
  /** Amount to bridge in decimal format. */
  amount: BigNumber | undefined;
  /** Destination address on Ink. */
  destinationAddress: Address;
}

/**
 * Result of the CCTP fee estimation.
 *
 * Gas fees and USDC fees are in different denominations and shown
 * separately in the UI — they should not be summed.
 */
export interface CctpEstimateResult {
  /** Estimated gas fees in the source chain's native token (e.g. ETH, MATIC). */
  gasFees: BigNumber;
  /** Circle CCTP protocol fee in USDC (only applies to FAST transfers). */
  protocolFees: BigNumber;
  /** Circle Forwarder relay fee in USDC (covers destination chain gas + service fee). */
  forwarderFees: BigNumber;
  /** Amount the user will receive on the destination chain in USDC (amount minus all USDC fees). */
  receiveAmount: BigNumber;
}

/**
 * Query hook to estimate CCTP bridge fees using Circle Bridge Kit SDK.
 * Provides real-time fee estimation for the bridge transfer.
 *
 * @param params - Query parameters including chain and amount.
 * @returns Query result with fee estimate data.
 */
export function useQueryCctpEstimate({
  sourceChainId,
  amount,
  destinationAddress,
}: Params) {
  const sourceChainConfig = getCctpChainConfig(sourceChainId);
  const { data: adapter } = useQueryCctpBridgeAdapter();

  const disabled = !amount || !adapter;

  return useQuery({
    queryKey: cctpEstimateQueryKey(sourceChainId, amount, destinationAddress),
    queryFn: async (): Promise<CctpEstimateResult> => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      // Call estimate API
      const estimate = await CCTP_BRIDGE_KIT.estimate({
        from: {
          adapter,
          chain: sourceChainConfig.sdkChainName,
        },
        to: {
          chain: CCTP_DESTINATION_SDK_CHAIN_NAME,
          recipientAddress: destinationAddress,
          useForwarder: true,
        },
        amount: amount.toString(),
        config: {
          transferSpeed: sourceChainConfig.supportsFastTransfer
            ? 'FAST'
            : 'SLOW',
        },
      });

      // Sum gas fees across all steps (approve, burn, mint).
      // Denominated in the source chain's native token (e.g. ETH).
      const gasFees = sumBigNumberBy(
        estimate.gasFees,
        (gasFee) => gasFee.fees?.fee ?? BigNumbers.ZERO,
      );

      // Circle's CCTP protocol fee, denominated in USDC.
      // Only charged for FAST transfers; typically 0 for SLOW.
      const providerFee = estimate.fees.find((f) => f.type === 'provider');
      const protocolFees = toBigNumber(providerFee?.amount ?? 0);

      // Circle Forwarder relay fee, denominated in USDC.
      // Covers destination chain gas + service fee ($0.20 for non-Ethereum destinations).
      const forwarderFee = estimate.fees.find((f) => f.type === 'forwarder');
      const forwarderFees = toBigNumber(forwarderFee?.amount ?? 0);

      // User receives the bridged amount minus all USDC-denominated fees.
      // Gas fees are paid separately from the user's native token balance.
      const receiveAmount = amount.minus(protocolFees).minus(forwarderFees);

      return {
        gasFees,
        protocolFees,
        forwarderFees,
        receiveAmount,
      };
    },
    enabled: !disabled,
  });
}
