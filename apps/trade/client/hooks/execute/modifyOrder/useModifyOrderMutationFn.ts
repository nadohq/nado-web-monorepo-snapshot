import {
  EngineOrderParams,
  getOrderDigest,
  getOrderNonce,
  packOrderAppendix,
  removeDecimals,
  toBigNumber,
} from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import {
  ModifyOrderParams,
  ModifyOrderResult,
} from 'client/hooks/execute/modifyOrder/types';
import { ValidExecuteContext } from 'client/hooks/execute/util/useExecuteInValidContext';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useGetRecvTime } from 'client/hooks/util/useGetRecvTime';
import { useNadoClientHasLinkedSigner } from 'client/hooks/util/useNadoClientHasLinkedSigner';
import { OrderSlippageSettings } from 'client/modules/localstorage/userState/types/tradingSettings';
import { MARKET_ORDER_EXECUTION_TYPE } from 'client/modules/trading/consts/marketOrderExecutionType';
import { useOrderSlippageSettings } from 'client/modules/trading/hooks/useOrderSlippageSettings';
import { getOrderSlippageMultiplier } from 'client/modules/trading/utils/getOrderSlippageMultiplier';
import { getPriceTriggerCriteria } from 'client/modules/trading/utils/trigger/getPriceTriggerCriteria';
import { getTriggerOrderDisplayType } from 'client/modules/trading/utils/trigger/getTriggerOrderDisplayType';
import { roundToIncrement } from 'client/utils/rounding';
import { useCallback } from 'react';

export function useModifyOrderMutationFn() {
  const getRecvTime = useGetRecvTime();
  const hasLinkedSigner = useNadoClientHasLinkedSigner();
  const { savedSettings: slippageSettings } = useOrderSlippageSettings();
  const { data: marketDataByProductId } = useAllMarketsStaticData();

  return useCallback(
    async (
      params: ModifyOrderParams,
      context: ValidExecuteContext,
    ): Promise<ModifyOrderResult> => {
      const marketStaticData =
        marketDataByProductId?.allMarkets[params.productId];
      const priceIncrement = marketStaticData?.priceIncrement;
      const decimalAdjustedSizeIncrement = removeDecimals(
        marketStaticData?.sizeIncrement,
      );

      if (params.isPriceTrigger) {
        // Trigger order
        if (!hasLinkedSigner) {
          throw new Error(
            '[useModifyOrderMutationFn] Cannot modify trigger order without linked signer',
          );
        }

        return cancelThenPlacePriceTriggerOrder({
          modifyOrderParams: params,
          context,
          getRecvTime,
          slippageSettings,
          priceIncrement,
          sizeIncrement: decimalAdjustedSizeIncrement,
        });
      }

      return cancelAndPlaceOrder({
        modifyOrderParams: params,
        getRecvTime,
        context,
        priceIncrement,
        sizeIncrement: decimalAdjustedSizeIncrement,
      });
    },
    [getRecvTime, hasLinkedSigner, slippageSettings, marketDataByProductId],
  );
}

interface CancelAndPlaceOrderParams {
  modifyOrderParams: ModifyOrderParams;
  getRecvTime: () => Promise<number>;
  context: ValidExecuteContext;
  priceIncrement: BigNumber | undefined;
  sizeIncrement: BigNumber | undefined;
}

async function cancelAndPlaceOrder({
  modifyOrderParams,
  getRecvTime,
  context,
  priceIncrement,
  sizeIncrement,
}: CancelAndPlaceOrderParams) {
  const [currentOrder, recvTime] = await Promise.all([
    context.nadoClient.context.engineClient.getOrder({
      digest: modifyOrderParams.digest,
      productId: modifyOrderParams.productId,
    }),
    getRecvTime(),
  ]);

  if (!currentOrder) {
    throw new Error(
      `[cancelAndPlaceOrder] Could not find order with digest ${modifyOrderParams.digest}.`,
    );
  }

  // Use new values if provided, otherwise keep existing values
  const newPrice = modifyOrderParams.newPrice ?? currentOrder.price;
  const newAmount = modifyOrderParams.newAmount ?? currentOrder.unfilledAmount;

  const nonce = getOrderNonce(recvTime);
  const result = await context.nadoClient.market.cancelAndPlace({
    cancelOrders: {
      subaccountOwner: context.subaccount.address,
      subaccountName: context.subaccount.name,
      chainId: context.subaccount.chainId,
      productIds: [modifyOrderParams.productId],
      digests: [modifyOrderParams.digest],
    },
    placeOrder: {
      chainId: context.subaccount.chainId,
      productId: modifyOrderParams.productId,
      order: {
        subaccountOwner: context.subaccount.address,
        subaccountName: context.subaccount.name,
        expiration: currentOrder.expiration,
        price: roundToIncrement(newPrice, priceIncrement),
        amount: roundToIncrement(newAmount, sizeIncrement),
        // Assume no change in margin transfer when modifying the order
        appendix: packOrderAppendix(currentOrder.appendix),
      },
      nonce,
    },
  });

  return { digest: result.data.digest };
}

interface CancelAndPlaceTriggerOrderParams {
  modifyOrderParams: ModifyOrderParams;
  context: ValidExecuteContext;
  getRecvTime: () => Promise<number>;
  slippageSettings: OrderSlippageSettings;
  priceIncrement: BigNumber | undefined;
  sizeIncrement: BigNumber | undefined;
}

async function cancelThenPlacePriceTriggerOrder({
  modifyOrderParams,
  context,
  getRecvTime,
  slippageSettings,
  priceIncrement,
  sizeIncrement,
}: CancelAndPlaceTriggerOrderParams) {
  const getTriggerOrder = async () => {
    // there is currently no 1:1 getTriggerOrder(digest) lookup API so we get pending
    // trigger orders for this product and then find the order with matching digest
    const productOrders = await context.nadoClient.market.getTriggerOrders({
      subaccountOwner: context.subaccount.address,
      subaccountName: context.subaccount.name,
      chainId: context.subaccount.chainId,
      statusTypes: ['waiting_price', 'waiting_dependency'],
      productIds: [modifyOrderParams.productId],
      digests: [modifyOrderParams.digest],
    });
    return productOrders.orders[0];
  };

  const [currentOrder, recvTime] = await Promise.all([
    getTriggerOrder(),
    getRecvTime(),
  ]);
  if (!currentOrder) {
    throw Error(
      '[cancelThenPlaceTriggerOrder] Could not find current trigger order',
    );
  }

  const priceTriggerCriteria = getPriceTriggerCriteria(
    currentOrder.order.triggerCriteria,
  );
  if (!priceTriggerCriteria) {
    throw Error(
      `[cancelThenPlaceTriggerOrder] No price trigger criteria found for order with digest ${modifyOrderParams.digest}`,
    );
  }

  const orderExecutionType = currentOrder.order.appendix.orderExecutionType;
  const isMarket = orderExecutionType === MARKET_ORDER_EXECUTION_TYPE;

  // Calculate slippage - only applies to market trigger orders
  // Limit trigger orders (stop limit) don't have slippage
  const slippageFraction = (() => {
    if (!isMarket) {
      return 0;
    }
    // Use appropriate slippage based on order type
    const orderDisplayType = getTriggerOrderDisplayType(currentOrder);
    switch (orderDisplayType) {
      case 'take_profit':
        return slippageSettings.takeProfit;
      case 'stop_loss':
        return slippageSettings.stopLoss;
      case 'stop_market':
        return slippageSettings.stopMarket;
      default:
        throw new Error(
          `[cancelThenPlaceTriggerOrder] Unknown order display type: ${orderDisplayType}`,
        );
    }
  })();

  // there is currently no atomic cancelAndPlace for trigger orders
  // so we have to cancel _then_ place the same order with the modified trigger
  await context.nadoClient.market.cancelTriggerOrders({
    subaccountOwner: context.subaccount.address,
    subaccountName: context.subaccount.name,
    chainId: context.subaccount.chainId,
    productIds: [modifyOrderParams.productId],
    digests: [modifyOrderParams.digest],
  });

  const isBuy = currentOrder.order.amount.isPositive();
  const serverOrderValues = currentOrder.serverOrder.order;
  const existingTriggerPrice = toBigNumber(priceTriggerCriteria.triggerPrice);

  // Use new values if provided, otherwise keep existing values
  const newTriggerPrice =
    modifyOrderParams.newTriggerPrice ?? existingTriggerPrice;
  const newAmount = modifyOrderParams.newAmount ?? serverOrderValues.amount;

  // Derive the new ENGINE order price
  // - If newPrice is explicitly provided, use it
  // - For market orders: default to trigger price × slippage
  // - For limit orders: default to existing limit price
  const orderSlippageMultiplier = getOrderSlippageMultiplier(
    isBuy,
    slippageFraction,
  );

  const newOrderPrice = (() => {
    if (modifyOrderParams.newPrice) {
      return modifyOrderParams.newPrice;
    }
    if (isMarket) {
      return newTriggerPrice.times(orderSlippageMultiplier);
    }
    return currentOrder.order.price;
  })();

  const order: EngineOrderParams = {
    subaccountOwner: context.subaccount.address,
    subaccountName: context.subaccount.name,
    price: roundToIncrement(newOrderPrice, priceIncrement),
    amount: roundToIncrement(toBigNumber(newAmount), sizeIncrement),
    expiration: serverOrderValues.expiration,
    appendix: serverOrderValues.appendix,
  };

  const nonce = getOrderNonce(recvTime);
  await context.nadoClient.market.placeTriggerOrder({
    chainId: context.subaccount.chainId,
    productId: modifyOrderParams.productId,
    triggerCriteria: {
      type: 'price',
      criteria: {
        ...priceTriggerCriteria,
        triggerPrice: newTriggerPrice,
      },
    },
    order,
    nonce,
  });

  // placeTriggerOrder does not currently return the digest so we compute it locally
  const digest = getOrderDigest({
    order: {
      ...order,
      nonce,
    },
    productId: modifyOrderParams.productId,
    chainId: context.subaccount.chainId,
  });
  return { digest };
}
