import { OrderDisplayType } from 'client/modules/trading/types/orderDisplayTypes';

export const ORDER_DISPLAY_TYPES = {
  stop: ['stop_market', 'stop_limit'],
  tpSl: ['take_profit', 'stop_loss'],
  engine: ['limit', 'market'],
  twap: ['twap'],
} satisfies Record<string, OrderDisplayType[]>;
