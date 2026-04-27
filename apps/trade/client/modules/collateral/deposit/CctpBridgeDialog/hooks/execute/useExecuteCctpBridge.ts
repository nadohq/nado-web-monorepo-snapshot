import { asyncResult } from '@nadohq/client';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import { CCTP_BRIDGE_KIT } from 'client/modules/collateral/deposit/CctpBridgeDialog/bridgeKit';
import {
  CCTP_DESTINATION_SDK_CHAIN_NAME,
  CctpSourceChainId,
  getCctpChainConfig,
} from 'client/modules/collateral/deposit/CctpBridgeDialog/config';
import { useQueryCctpBridgeAdapter } from 'client/modules/collateral/deposit/CctpBridgeDialog/hooks/query/useQueryCctpBridgeAdapter';
import { Address } from 'viem';

/**
 * Parameters for executing a CCTP bridge.
 */
interface ExecuteCctpBridgeParams {
  /** Source chain ID to bridge from. */
  sourceChainId: CctpSourceChainId;
  /** Amount to bridge in decimal format. */
  amount: string;
  /** Destination address on Ink. */
  destinationAddress: Address;
}

/**
 * Execute hook for CCTP bridge operations using Circle Bridge Kit SDK.
 *
 * The mutation resolves as soon as the source-chain burn is confirmed (via the
 * `burn` event) rather than waiting for the full cross-chain flow (attestation
 * + mint). The bridge() call continues in the background with the forwarder
 * handling the mint on the destination chain.
 */
export function useExecuteCctpBridge() {
  const { data: adapter } = useQueryCctpBridgeAdapter();

  return useMutation({
    mutationFn: async (params: ExecuteCctpBridgeParams) => {
      const sourceChainConfig = getCctpChainConfig(params.sourceChainId);

      if (!adapter) {
        throw new Error(
          'CCTP bridge adapter is not initialized. Ensure wallet is connected and the adapter query has resolved.',
        );
      }

      const bridgeParams = {
        from: {
          adapter,
          chain: sourceChainConfig.sdkChainName,
        },
        to: {
          chain: CCTP_DESTINATION_SDK_CHAIN_NAME,
          recipientAddress: params.destinationAddress,
          useForwarder: true,
        },
        amount: params.amount,
        config: {
          transferSpeed: sourceChainConfig.supportsFastTransfer
            ? 'FAST'
            : 'SLOW',
        },
      } as const;

      // Resolve mutation on burn confirmation, not on full bridge completion.
      // `bridge()` never throws — it always resolves with a result object,
      // so we inspect `result.state` to detect errors.
      return new Promise<{ state: 'burn_confirmed' }>(
        async (resolve, reject) => {
          const onBurn = (event: {
            values: { state: string; error?: unknown };
          }) => {
            CCTP_BRIDGE_KIT.off('burn', onBurn);

            // The SDK fires `burn` for both success and failure of the burn
            // step. When the user rejects the tx, the event carries
            // `values.state === 'error'` with the original error.
            if (event.values.state === 'error') {
              reject(event.values.error);
              return;
            }

            resolve({ state: 'burn_confirmed' });
          };
          CCTP_BRIDGE_KIT.on('burn', onBurn);

          // Fire and forget — bridge continues in background after burn.
          // On success, bridge() resolves after the full cross-chain flow
          // (burn → attestation → mint), so this runs after onBurn has
          // already resolved the promise. In that case result.state is
          // 'success', we skip the if block, and even if reject() were
          // called it would be a no-op on an already-resolved promise.
          const [result, error] = await asyncResult(
            CCTP_BRIDGE_KIT.bridge(bridgeParams),
          );

          if (error || result?.state === 'error') {
            CCTP_BRIDGE_KIT.off('burn', onBurn);
            const failedStep = result?.steps?.find((s) => s.error);

            // Preserve the original error so isUserDeniedError can detect
            // wallet rejections and logExecuteError handles them correctly.
            reject(error ?? failedStep?.error);
          }
        },
      );
    },
    onError(error, variables) {
      logExecuteError('CctpBridge', error, variables);
    },
  });
}
