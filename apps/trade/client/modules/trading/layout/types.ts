import { MarketCategory } from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { IconComponent } from '@nadohq/web-ui';
import { SubaccountCountIndicatorKey } from 'client/hooks/subaccount/useSubaccountCountIndicators';
import { TabIdentifiable } from 'client/hooks/ui/tabs/types';
import { TradingTableTabFilterId } from 'client/modules/localstorage/userState/types/tradingSettings';
import { ComponentType, ReactNode } from 'react';

export interface TradingSectionProps extends WithClassnames {
  productId: number | undefined;
}

export interface TradingTab<
  TTabID extends string = string,
> extends TabIdentifiable<TTabID> {
  label: string;
  content: ReactNode;
  countIndicatorKey?: SubaccountCountIndicatorKey;
  displayFilter?: TradingTableTabFilterId;
}

export type TradingSubTab<TTabID extends string = string> = Omit<
  TradingTab<TTabID>,
  'displayFilter'
>;

export interface MobileTradingBottomNavigationTab extends TabIdentifiable<string> {
  label: string;
  icon: IconComponent;
  content: ReactNode;
}

export interface MarketSwitcherProps {
  triggerClassName?: string;
}

export interface TradingLayoutProps {
  /** This is the productId of the current market. */
  productId: number | undefined;
  /** This is the default market category to display in the switcher. */
  marketSwitcherDefaultCategory: MarketCategory;
  /** This is the component that will display in the info cards section. */
  InfoCards: ComponentType<WithClassnames>;
  /** This is the component that will display in the order placement section. */
  OrderPlacement: ComponentType<WithClassnames>;
  /** This is the component that will display in the chart section. */
  ChartComponent: ComponentType<TradingSectionProps>;
}
