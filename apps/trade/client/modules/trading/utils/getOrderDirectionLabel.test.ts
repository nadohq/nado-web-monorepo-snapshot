import { ProductEngineType } from '@nadohq/client';
import { expect, test } from 'bun:test';
import { getOrderDirectionLabel } from 'client/modules/trading/utils/getOrderDirectionLabel';
import i18n from 'common/i18n/i18n';
import { t } from 'i18next';

if (!i18n.isInitialized) {
  throw new Error('i18n must be initialized before running tests');
}

test('getOrderDirectionLabel return value', () => {
  const tests: Array<{
    input: Omit<Parameters<typeof getOrderDirectionLabel>[0], 't'>;
    expected: string;
  }> = [
    // spot cases
    {
      input: {
        productType: ProductEngineType.SPOT,
        orderSide: 'long',
        isReduceOnly: true,
      },
      expected: 'Sell',
    },
    {
      input: {
        productType: ProductEngineType.SPOT,
        orderSide: 'short',
        isReduceOnly: true,
      },
      expected: 'Buy',
    },

    // perp cases (non-reversal)
    {
      input: {
        productType: ProductEngineType.PERP,
        orderSide: 'long',
        isReduceOnly: false,
      },
      expected: 'Long',
    },
    {
      input: {
        productType: ProductEngineType.PERP,
        orderSide: 'short',
        isReduceOnly: false,
      },
      expected: 'Short',
    },
    {
      input: {
        productType: ProductEngineType.PERP,
        orderSide: 'long',
        isReduceOnly: true,
      },
      expected: 'Close Short',
    },
    {
      input: {
        productType: ProductEngineType.PERP,
        orderSide: 'short',
        isReduceOnly: true,
      },
      expected: 'Close Long',
    },

    // perp cases (reversal)
    {
      input: {
        productType: ProductEngineType.PERP,
        orderSide: 'long',
        isReduceOnly: false,
        isReversal: true,
      },
      expected: 'Short ➞ Long',
    },
    {
      input: {
        productType: ProductEngineType.PERP,
        orderSide: 'short',
        isReduceOnly: false,
        isReversal: true,
      },
      expected: 'Long ➞ Short',
    },

    // impossible cases (reduce-only reversal)
    // we test them to ensure graceful handling
    {
      input: {
        productType: ProductEngineType.PERP,
        orderSide: 'long',
        isReduceOnly: true,
        isReversal: true,
      },
      expected: 'Short',
    },
    {
      input: {
        productType: ProductEngineType.PERP,
        orderSide: 'short',
        isReduceOnly: true,
        isReversal: true,
      },
      expected: 'Long',
    },
  ];

  for (const { input, expected } of tests) {
    const actual = (() => getOrderDirectionLabel({ ...input, t }))();
    expect(actual).toBe(expected);
  }
});
