import { NLP_TOKEN_INFO, useNadoMetadataContext } from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { TablePlaceholder } from 'client/components/DataTable/TablePlaceholder';
import { TriggerOrderPlaceholderContent } from 'client/modules/tables/TriggerOrderTablePlaceholderContent';
import { useTranslation } from 'react-i18next';

/**
 * Type identifier for different table empty states across the application.
 * Categorized into historical events, current state, and margin manager features.
 */
export type EmptyTablePlaceholderType =
  | 'history_trades'
  | 'history_deposits'
  | 'history_withdrawals'
  | 'history_transfers'
  | 'history_liquidations'
  | 'history_settlements'
  | 'history_trigger_orders'
  | 'history_interest_payments'
  | 'history_funding_payments'
  | 'history_nlp'
  | 'history_orders'
  | 'spot_balances'
  | 'perp_positions'
  | 'open_limit_orders'
  | 'open_price_trigger_orders'
  | 'open_time_trigger_orders'
  | 'margin_manager_quote_balance'
  | 'referred_traders'
  | 'nlp_balances'
  | 'nlp_positions'
  | 'nlp_open_orders'
  | 'points_history'
  | 'spreads';

/**
 * Renders an appropriate empty state placeholder message for data tables based on the table type.
 * Includes specialized content for trigger order tables with one-click trading requirements.
 * @param type - EmptyTablePlaceholderType determining which placeholder message to display.
 * @param className - Optional CSS classes for styling the placeholder container.
 * @returns A styled placeholder component with contextual empty state messaging.
 */
export function EmptyTablePlaceholder({
  type,
  className,
}: WithClassnames<{
  type: EmptyTablePlaceholderType;
}>) {
  const { t } = useTranslation();
  const { primaryQuoteToken } = useNadoMetadataContext();

  const placeholderContent = (() => {
    switch (type) {
      // Historical placeholders
      case 'history_trades':
        return t(($) => $.emptyPlaceholders.trades);
      case 'history_deposits':
        return t(($) => $.emptyPlaceholders.deposits);
      case 'history_withdrawals':
        return t(($) => $.emptyPlaceholders.withdrawals);
      case 'history_transfers':
        return t(($) => $.emptyPlaceholders.transfers);
      case 'history_liquidations':
        return t(($) => $.emptyPlaceholders.liquidations);
      case 'history_settlements':
        return t(($) => $.emptyPlaceholders.perpSettlements);
      case 'history_trigger_orders':
        return (
          <TriggerOrderPlaceholderContent>
            {t(($) => $.emptyPlaceholders.historicalTriggerOrders)}
          </TriggerOrderPlaceholderContent>
        );
      case 'history_interest_payments':
        return t(($) => $.emptyPlaceholders.interestPayments);
      case 'history_funding_payments':
        return t(($) => $.emptyPlaceholders.fundingPayments);
      case 'history_nlp':
        return t(($) => $.emptyPlaceholders.symbolEvents, {
          symbol: NLP_TOKEN_INFO.symbol,
        });
      case 'history_orders':
        return t(($) => $.emptyPlaceholders.orderHistory);

      // Current state placeholders
      case 'spot_balances':
        return t(($) => $.emptyPlaceholders.balances);
      case 'perp_positions':
        return t(($) => $.emptyPlaceholders.perpPositions);
      case 'open_limit_orders':
        return t(($) => $.emptyPlaceholders.openLimitOrders);
      case 'open_price_trigger_orders':
        return (
          <TriggerOrderPlaceholderContent>
            {t(($) => $.emptyPlaceholders.openOrders)}
          </TriggerOrderPlaceholderContent>
        );
      case 'open_time_trigger_orders':
        return (
          <TriggerOrderPlaceholderContent>
            {t(($) => $.emptyPlaceholders.openOrders)}
          </TriggerOrderPlaceholderContent>
        );
      case 'margin_manager_quote_balance':
        return t(($) => $.emptyPlaceholders.symbolBalance, {
          symbol: primaryQuoteToken.symbol,
        });
      case 'referred_traders':
        return t(($) => $.emptyPlaceholders.referredTraders);
      case 'nlp_balances':
        return t(($) => $.emptyPlaceholders.nlpBalances);
      case 'nlp_positions':
        return t(($) => $.emptyPlaceholders.nlpPositions);
      case 'nlp_open_orders':
        return t(($) => $.emptyPlaceholders.nlpOpenOrders);
      case 'points_history':
        return t(($) => $.emptyPlaceholders.pointsHistory);
      case 'spreads':
        return t(($) => $.emptyPlaceholders.spreads);
    }
  })();

  return (
    <TablePlaceholder className={className}>
      {placeholderContent}
    </TablePlaceholder>
  );
}
