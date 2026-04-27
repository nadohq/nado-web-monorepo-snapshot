import { cleanup, render, screen } from '@testing-library/react';
import { BigNumber } from 'bignumber.js';
import { afterEach, describe, expect, test } from 'bun:test';
import { TpSlDialogEstimatedPnl } from 'client/modules/trading/tpsl/components/TpSlDialogEstimatedPnl';
import { TpSlOrderFormPriceState } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import i18n from 'common/i18n/i18n';
import { I18nextProvider } from 'react-i18next';

function renderWithI18n(component: React.ReactElement) {
  return render(component, {
    wrapper: ({ children }) => (
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    ),
  });
}

type TpSlEstimatedPnlPriceStateProps = Pick<
  TpSlOrderFormPriceState,
  'isTakeProfit' | 'hasRequiredValues' | 'estimatedPnlUsd' | 'estimatedPnlFrac'
>;

// Helper to have cleaner/shorter testcase definitions
function createPriceState(
  type: 'TP' | 'SL',
  pnl: number,
  roe: number,
  ready: boolean = true,
): TpSlEstimatedPnlPriceStateProps {
  return {
    isTakeProfit: type === 'TP',
    hasRequiredValues: ready,
    estimatedPnlUsd: new BigNumber(pnl),
    estimatedPnlFrac: new BigNumber(roe),
  };
}

function createTPPriceState(pnl: number, roe: number, ready: boolean = true) {
  return createPriceState('TP', pnl, roe, ready);
}

function createSLPriceState(pnl: number, roe: number, ready: boolean = true) {
  return createPriceState('SL', pnl, roe, ready);
}

describe('TpSlDialogEstimatedPnl', () => {
  afterEach(cleanup);

  type TestCase = {
    name: string;
    props: {
      tpState?: any;
      slState?: any;
    };
    expectedText?: string;
    shouldRender: boolean;
  };

  const cases: TestCase[] = [
    {
      name: 'Renders nothing when both states are undefined',
      props: { tpState: undefined, slState: undefined },
      shouldRender: false,
    },
    {
      name: 'Renders nothing when states exist but lack required values',
      props: {
        tpState: createTPPriceState(100, 10, false),
        slState: createSLPriceState(-50, -5, false),
      },
      shouldRender: false,
    },
    {
      name: 'Renders TP Profit only',
      props: {
        tpState: createTPPriceState(150.5, 0.15),
        slState: undefined,
      },
      expectedText: 'Est. TP profit of $150.50 (ROE: 15%)',
      shouldRender: true,
    },
    {
      name: 'Renders SL Loss only',
      props: {
        tpState: undefined,
        // Negative SL
        slState: createSLPriceState(-20.0, -0.05),
      },
      expectedText: 'Est. SL loss of −$20.00 (ROE: −5%)',
      shouldRender: true,
    },
    {
      name: 'Renders Combined TP (Profit) and SL (Loss)',
      props: {
        tpState: createTPPriceState(200, 0.2),
        slState: createSLPriceState(-100, -0.1),
      },
      expectedText:
        'Est. TP profit of $200.00 (ROE: 20%) and SL loss of −$100.00 (ROE: −10%)',
      shouldRender: true,
    },
    {
      name: 'Renders Combined TP (Loss) and SL (Profit) - edge case inverted',
      props: {
        tpState: createTPPriceState(-10, -0.01), // Maybe a weird hedge case
        slState: createSLPriceState(50, 0.05),
      },
      expectedText:
        'Est. TP loss of −$10.00 (ROE: −1%) and SL profit of $50.00 (ROE: 5%)',
      shouldRender: true,
    },
  ];

  test.each(cases)('$name', ({ props, expectedText, shouldRender }) => {
    renderWithI18n(<TpSlDialogEstimatedPnl {...props} />);

    const element = screen.queryByTestId('tpsl-dialog-estimated-pnl');

    if (!shouldRender) {
      expect(element).toBeNull();
    } else {
      expect(element).not.toBeNull();
      // We normalize whitespace to ignore minor formatting differences in Trans vs strings
      const normalizedContent = element?.textContent
        ?.replace(/\s+/g, ' ')
        .trim();
      expect(normalizedContent).toBe(expectedText);
    }
  });
});
