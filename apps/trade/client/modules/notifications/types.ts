import {
  EngineServerExecuteSuccessResult,
  OrderAppendix,
  ProductEngineType,
  TriggerServerExecuteSuccessResult,
} from '@nadohq/client';
import { TokenIconMetadata } from '@nadohq/react-client';
import { SizeClass } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ExecutePlaceOrderParams } from 'client/hooks/execute/placeOrder/types';
import { useGetConfirmedTx } from 'client/hooks/util/useGetConfirmedTx';
import { FeatureNotificationDisclosureKey } from 'client/modules/localstorage/userState/types/userDisclosureTypes';
import { OrderDisplayType } from 'client/modules/trading/types/orderDisplayTypes';
import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import type { TFunction } from 'i18next';

/**
 * Additional data surrounding user/app state required by notification handlers
 */
export interface NotificationDispatchContext {
  t: TFunction;
  getConfirmedTx: ReturnType<typeof useGetConfirmedTx>;
  sizeClass: SizeClass;
  enableTradingNotifications: boolean;
}

interface OnChainExecutionData {
  txHashPromise: Promise<string>;
}

interface ServerExecutionData {
  serverExecutionResult: Promise<unknown>;
}

export interface OrderNotificationMetadata {
  icon: TokenIconMetadata;
  symbol: string;
  marketName: string;
  priceIncrement: BigNumber | undefined;
  sizeIncrement: BigNumber | undefined;
}

interface OrderActionData {
  executeResult: Promise<
    | EngineServerExecuteSuccessResult<'place_orders'>
    | TriggerServerExecuteSuccessResult<'place_orders'>
  >;
}

export interface ActionErrorHandlerNotificationData {
  executionData: OnChainExecutionData | ServerExecutionData;
  errorNotificationTitle: string;
}

export interface CancelOrderNotificationData extends ServerExecutionData {
  cancelOrderParams: {
    orderDisplayType: OrderDisplayType;
    decimalAdjustedAmount: BigNumber;
    metadata: OrderNotificationMetadata;
    type: ProductEngineType;
  };
}

export interface CancelMultiOrdersNotificationData extends ServerExecutionData {
  numOrders: number;
}

export interface ClosePositionNotificationData extends OrderActionData {
  closePositionParams: {
    fraction: number;
    size: BigNumber;
    positionAmount: BigNumber;
    limitPrice: BigNumber | undefined;
    metadata: OrderNotificationMetadata;
  };
}

export interface PlaceOrderNotificationData extends OrderActionData {
  placeOrderParams: ExecutePlaceOrderParams;
  orderMarketType: ProductEngineType;
  orderType: PlaceOrderType;
  metadata: OrderNotificationMetadata;
}

export interface OrderFillNotificationData {
  orderAppendix: OrderAppendix;
  digest: string;
  productId: number;
  newOrderFilledAmount: BigNumber;
  totalAmount: BigNumber;
  orderDisplayType: OrderDisplayType;
  fillPrice: BigNumber;
}

export interface LiquidationNotificationData {
  isSpotLiquidated: boolean;
  isPerpLiquidated: boolean;
}

export interface MaintMarginUsageNotificationData {
  maintMarginUsageFraction: BigNumber;
}

export interface CloseMultiPositionsNotificationData extends OrderActionData {}

export interface AcceptFuulReferralNotificationData {
  referralCode: string;
}

export interface DepositNotificationData {
  amount: BigNumber;
  symbol: string;
  icon: TokenIconMetadata;
  valueUsd: BigNumber;
  submissionIndex: string;
}

export interface CctpBridgeNotificationData {
  /** Connected wallet address of the user. */
  address: string;
}

export interface Usdt0BridgeNotificationData {
  txHashPromise: Promise<string>;
}

/**
 * All possible notification types
 */
export type DispatchNotificationParams =
  | {
      // Used for generic actions where a pending / success state isn't needed. Instead, we watch for errors
      // and display a detail notification if an error occurs.
      type: 'action_error_handler';
      data: ActionErrorHandlerNotificationData;
    }
  | {
      type: 'cancel_order';
      data: CancelOrderNotificationData;
    }
  | {
      type: 'cancel_multi_orders';
      data: CancelMultiOrdersNotificationData;
    }
  | {
      type: 'place_order';
      data: PlaceOrderNotificationData;
    }
  | {
      type: 'order_fill';
      data: OrderFillNotificationData;
    }
  | {
      type: 'close_position';
      data: ClosePositionNotificationData;
    }
  | {
      type: 'maint_margin_usage_warning';
      data: MaintMarginUsageNotificationData;
    }
  | {
      type: 'margin_usage_warning';
    }
  | {
      type: 'liquidation';
      data: LiquidationNotificationData;
    }
  | {
      type: 'new_feature';
      data: FeatureNotificationDisclosureKey;
    }
  | {
      type: 'close_multi_positions';
      data: CloseMultiPositionsNotificationData;
    }
  | {
      type: 'deposit_success';
      data: DepositNotificationData;
    }
  | {
      type: 'usdt0_bridge';
      data: Usdt0BridgeNotificationData;
    }
  | {
      type: 'smart_contract_wallet_helper';
    }
  | {
      type: 'cctp_bridge';
      data: CctpBridgeNotificationData;
    };

export type NotificationType = DispatchNotificationParams['type'];
