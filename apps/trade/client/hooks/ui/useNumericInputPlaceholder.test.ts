import { BigNumber } from 'bignumber.js';
import { expect, test } from 'bun:test';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';

test('useNumericInputPlaceholder return value', () => {
  const tests = [
    {
      input: undefined,
      expected: '0.00',
    },
    {
      input: { increment: undefined },
      expected: '0.00',
    },
    {
      input: { increment: '1' },
      expected: '0',
    },
    {
      input: { increment: new BigNumber(10) },
      expected: '0',
    },
    {
      input: { increment: new BigNumber('0.0005') },
      expected: '0.0000',
    },
    {
      input: { increment: new BigNumber('0.00001') },
      expected: '0.00000',
    },
    {
      // scientific notation
      input: { increment: new BigNumber('1e-6') },
      expected: '0.000000',
    },
    {
      // trailing zero should never happen but we should still handle
      input: { increment: new BigNumber('0.000010') },
      expected: '0.00000',
    },
    {
      // invalid case, just checking we do not throw
      input: { increment: new BigNumber('0') },
      expected: '0',
    },
    {
      input: { decimals: 0 },
      expected: '0',
    },
    {
      input: { decimals: 1 },
      expected: '0.0',
    },
    {
      input: { decimals: new BigNumber(2) },
      expected: '0.00',
    },
    {
      // should never happen but we should still handle
      input: { decimals: new BigNumber(3.2) },
      expected: '0.000',
    },
  ];

  for (const { input, expected } of tests) {
    const actual = (() => useNumericInputPlaceholder(input))();
    expect(actual).toBe(expected);
  }
});

test('useNumericInputPlaceholder throws', () => {
  const tests = [
    {
      // should never happen, throw to inform caller is broken
      input: { decimals: -1 },
    },
    {
      // should never happen, throw to inform caller is broken
      input: { decimals: new BigNumber('-1') },
    },
  ];

  for (const { input } of tests) {
    expect(() => useNumericInputPlaceholder(input)).toThrow();
  }
});
