import {
  type DynamicTargetAssetCandidate,
  type FunkitCheckoutConfig,
} from '@funkit/connect';
import { QUOTE_PRODUCT_ID } from '@nadohq/client';
import { KNOWN_PRODUCT_IDS } from '@nadohq/react-client';
import { type AllMarketsStaticDataForChainEnv } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { type Address } from 'viem';
import { ink } from 'viem/chains';

interface FunDepositProductInfo {
  iconSrc: string;
  dynamicRoutingId: string;
  assetClass?: 'xstock';
  // For xstocks, the dynamically fetched token address is the wrapped variant
  // Fun.xyz requires the unwrapped address for routing, so we override it
  tokenAddress?: Address;
}

// Nado spot product IDs eligible for Fun deposits
const FUN_DEPOSIT_PRODUCT_INFO_BY_PRODUCT_ID: Record<
  number,
  FunDepositProductInfo
> = {
  [QUOTE_PRODUCT_ID]: {
    iconSrc: 'https://sdk-cdn.fun.xyz/images/usdt0.svg',
    dynamicRoutingId: 'NADO_USDT0_PERPS',
  },
  [KNOWN_PRODUCT_IDS.kbtc]: {
    iconSrc: 'https://sdk-cdn.fun.xyz/images/kbtc.svg',
    dynamicRoutingId: 'NADO_KBTC_SPOT',
  },
  [KNOWN_PRODUCT_IDS.weth]: {
    iconSrc: 'https://sdk-cdn.fun.xyz/images/weth.svg',
    dynamicRoutingId: 'NADO_WETH_SPOT',
  },
  [KNOWN_PRODUCT_IDS.usdc]: {
    iconSrc: 'https://sdk-cdn.fun.xyz/images/usdc.svg',
    dynamicRoutingId: 'NADO_USDC_SPOT',
  },
  [KNOWN_PRODUCT_IDS.qqqx]: {
    iconSrc: 'https://sdk-cdn.fun.xyz/images/qqqx.svg',
    dynamicRoutingId: 'NADO_QQQX_SPOT',
    assetClass: 'xstock',
    tokenAddress: '0xa753A7395cAe905Cd615Da0B82A53E0560f250af',
  },
  [KNOWN_PRODUCT_IDS.spyx]: {
    iconSrc: 'https://sdk-cdn.fun.xyz/images/spyx.svg',
    dynamicRoutingId: 'NADO_SPYX_SPOT',
    assetClass: 'xstock',
    tokenAddress: '0x90A2a4c76b5D8c0bc892A69EA28Aa775a8f2dD48',
  },
  [KNOWN_PRODUCT_IDS.aaplx]: {
    iconSrc: 'https://sdk-cdn.fun.xyz/images/aaplx.svg',
    dynamicRoutingId: 'NADO_AAPLX_SPOT',
    assetClass: 'xstock',
    tokenAddress: '0x9d275685dC284C8eB1C79f6ABA7a63Dc75ec890a',
  },
  [KNOWN_PRODUCT_IDS.googlx]: {
    iconSrc: 'https://sdk-cdn.fun.xyz/images/googlx.svg',
    dynamicRoutingId: 'NADO_GOOGLX_SPOT',
    assetClass: 'xstock',
    tokenAddress: '0xe92f673Ca36C5E2Efd2DE7628f815f84807e803F',
  },
  [KNOWN_PRODUCT_IDS.metax]: {
    iconSrc: 'https://sdk-cdn.fun.xyz/images/metax.svg',
    dynamicRoutingId: 'NADO_METAX_SPOT',
    assetClass: 'xstock',
    tokenAddress: '0x96702be57Cd9777f835117a809C7124fe4ec989A',
  },
  [KNOWN_PRODUCT_IDS.nvdax]: {
    iconSrc: 'https://sdk-cdn.fun.xyz/images/nvdax.svg',
    dynamicRoutingId: 'NADO_NVDAX_SPOT',
    assetClass: 'xstock',
    tokenAddress: '0xc845b2894dBddd03858fd2D643B4eF725fE0849d',
  },
  [KNOWN_PRODUCT_IDS.tslax]: {
    iconSrc: 'https://sdk-cdn.fun.xyz/images/tslax.svg',
    dynamicRoutingId: 'NADO_TSLAX_SPOT',
    assetClass: 'xstock',
    tokenAddress: '0x8aD3c73F833d3F9A523aB01476625F269aEB7Cf0',
  },
};

interface CandidateAsset extends DynamicTargetAssetCandidate {
  productId: number;
  dynamicRoutingId: string;
  assetClass: 'xstock' | undefined;
}

interface BuildDepositCheckoutConfigParams {
  initialProductId: number | undefined;
  staticMarketData: AllMarketsStaticDataForChainEnv | undefined;
  modalTitle: string;
  directDepositAddress: Address | undefined;
  requiresInitialDeposit: boolean;
}

/**
 * Assembles the Fun checkout config for depositing into the user's Nado subaccount.
 * Fun handles the deposit transaction natively; we supply the user's DDA as
 * `customRecipient` and enforce a deposit minimum for uninitialised subaccounts.
 */
export function buildDepositCheckoutConfig({
  initialProductId,
  staticMarketData,
  modalTitle,
  directDepositAddress,
  requiresInitialDeposit,
}: BuildDepositCheckoutConfigParams): FunkitCheckoutConfig | undefined {
  const funDepositTargetChainId = String(ink.id);

  if (!staticMarketData || !directDepositAddress) {
    return;
  }

  const candidateAssets: CandidateAsset[] = [];
  let defaultCandidate: CandidateAsset | undefined;

  Object.entries(FUN_DEPOSIT_PRODUCT_INFO_BY_PRODUCT_ID).forEach(
    ([productIdStr, info]) => {
      const productId = Number(productIdStr);
      const spotProduct = staticMarketData.spotProducts[productId];
      if (!spotProduct) return;

      const candidate: CandidateAsset = {
        tokenSymbol: spotProduct.metadata.token.symbol,
        tokenChainId: funDepositTargetChainId,
        tokenAddress: info.tokenAddress ?? spotProduct.metadata.token.address,
        iconSrc: info.iconSrc,
        dynamicRoutingId: info.dynamicRoutingId,
        assetClass: info.assetClass,
        productId,
      };
      candidateAssets.push(candidate);

      if (productId === initialProductId) {
        defaultCandidate = candidate;
      } else if (
        productId === QUOTE_PRODUCT_ID &&
        defaultCandidate === undefined
      ) {
        defaultCandidate = candidate;
      }
    },
  );

  if (!defaultCandidate) return;

  return {
    modalTitle,
    targetChain: funDepositTargetChainId,
    targetAsset: defaultCandidate.tokenAddress,
    targetAssetTicker: defaultCandidate.tokenSymbol,
    checkoutItemTitle: defaultCandidate.tokenSymbol,
    iconSrc: defaultCandidate.iconSrc,
    dynamicTargetAssetCandidates: candidateAssets,
    customRecipient: directDepositAddress,
    getMinDepositUSD: () => (requiresInitialDeposit ? 5 : 0),
  };
}
