import { expect, test } from 'bun:test';
import { MARKET_ORDER_EXECUTION_TYPE } from 'client/modules/trading/consts/marketOrderExecutionType';
import { getOrderTypeLabel } from 'client/modules/trading/utils/getOrderTypeLabel';
import i18n from 'common/i18n/i18n';
import { t } from 'i18next';

if (!i18n.isInitialized) {
  throw new Error('i18n must be initialized before running tests');
}

test('getOrderTypeLabel return value', () => {
  const tests: Array<{
    input: Omit<Parameters<typeof getOrderTypeLabel>[0], 't'>;
    expected: string;
  }> = [
    {
      input: {
        orderAppendix: { orderExecutionType: 'default' },
        orderSide: 'long',
        priceTriggerCriteria: undefined,
      },
      expected: 'Limit',
    },
    {
      input: {
        orderAppendix: { orderExecutionType: 'default' },
        orderSide: 'short',
        priceTriggerCriteria: undefined,
      },
      expected: 'Limit',
    },
    {
      input: {
        orderAppendix: { orderExecutionType: 'default', reduceOnly: true },
        orderSide: 'long',
        priceTriggerCriteria: undefined,
      },
      expected: 'Limit',
    },
    {
      input: {
        orderAppendix: { orderExecutionType: 'default', reduceOnly: true },
        orderSide: 'short',
        priceTriggerCriteria: undefined,
      },
      expected: 'Limit',
    },
    {
      input: {
        orderAppendix: { orderExecutionType: MARKET_ORDER_EXECUTION_TYPE },
        orderSide: 'long',
        priceTriggerCriteria: undefined,
      },
      expected: 'Market',
    },
    {
      input: {
        orderAppendix: { orderExecutionType: MARKET_ORDER_EXECUTION_TYPE },
        orderSide: 'short',
        priceTriggerCriteria: undefined,
      },
      expected: 'Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          reduceOnly: true,
        },
        orderSide: 'long',
        priceTriggerCriteria: undefined,
      },
      expected: 'Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          reduceOnly: true,
        },
        orderSide: 'short',
        priceTriggerCriteria: undefined,
      },
      expected: 'Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'price',
        },
        orderSide: 'long',
        priceTriggerCriteria: undefined,
      },
      expected: 'Stop Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'price',
        },
        orderSide: 'short',
        priceTriggerCriteria: undefined,
      },
      expected: 'Stop Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'price',
          reduceOnly: true,
        },
        orderSide: 'long',
        priceTriggerCriteria: undefined,
      },
      expected: 'Stop Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'price',
          reduceOnly: true,
        },
        orderSide: 'short',
        priceTriggerCriteria: undefined,
      },
      expected: 'Stop Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'price',
          reduceOnly: true,
        },
        orderSide: 'long',
        priceTriggerCriteria: { type: 'last_price_above', triggerPrice: 1000 },
      },
      expected: 'SL Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'price',
          reduceOnly: true,
        },
        orderSide: 'short',
        priceTriggerCriteria: { type: 'last_price_below', triggerPrice: 1000 },
      },
      expected: 'SL Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'price',
          reduceOnly: true,
        },
        orderSide: 'long',
        priceTriggerCriteria: { type: 'last_price_above', triggerPrice: 1000 },
      },
      expected: 'SL Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'price',
          reduceOnly: true,
        },
        orderSide: 'short',
        priceTriggerCriteria: { type: 'last_price_below', triggerPrice: 1000 },
      },
      expected: 'SL Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'price',
          reduceOnly: true,
        },
        orderSide: 'long',
        priceTriggerCriteria: { type: 'last_price_below', triggerPrice: 1000 },
      },
      expected: 'TP Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'price',
          reduceOnly: true,
        },
        orderSide: 'short',
        priceTriggerCriteria: { type: 'last_price_above', triggerPrice: 1000 },
      },
      expected: 'TP Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'price',
          reduceOnly: true,
        },
        orderSide: 'long',
        priceTriggerCriteria: { type: 'last_price_below', triggerPrice: 1000 },
      },
      expected: 'TP Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'price',
          reduceOnly: true,
        },
        orderSide: 'short',
        priceTriggerCriteria: { type: 'last_price_above', triggerPrice: 1000 },
      },
      expected: 'TP Market',
    },

    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'twap',
          reduceOnly: true,
        },
        orderSide: 'long',
        priceTriggerCriteria: undefined,
      },
      expected: 'TWAP Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'twap',
          reduceOnly: true,
        },
        orderSide: 'short',
        priceTriggerCriteria: undefined,
      },
      expected: 'TWAP Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'twap_custom_amounts',
          reduceOnly: true,
        },
        orderSide: 'long',
        priceTriggerCriteria: undefined,
      },
      expected: 'TWAP Market',
    },
    {
      input: {
        orderAppendix: {
          orderExecutionType: MARKET_ORDER_EXECUTION_TYPE,
          triggerType: 'twap_custom_amounts',
          reduceOnly: true,
        },
        orderSide: 'short',
        priceTriggerCriteria: undefined,
      },
      expected: 'TWAP Market',
    },
  ];

  for (const { input, expected } of tests) {
    const actual = (() => getOrderTypeLabel({ ...input, t }))();
    expect(actual).toBe(expected);
  }
});
