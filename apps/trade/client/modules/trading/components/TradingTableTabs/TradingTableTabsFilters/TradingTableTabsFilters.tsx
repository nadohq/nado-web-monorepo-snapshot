import { WithChildren } from '@nadohq/web-common';
import { Checkbox } from '@nadohq/web-ui';
import { TradingTableTabFilterId } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useTradingTableTabsFiltersContext } from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/TradingTableTabsFiltersContext';
import { useTranslation } from 'react-i18next';

interface CheckboxFilterProps extends WithChildren {
  filterId: TradingTableTabFilterId;
}

function CheckboxFilter({ filterId, children }: CheckboxFilterProps) {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const currentValue = savedUserState.trading.tradingTableTabFilters[filterId];

  const handleChange = (checked: boolean) => {
    setSavedUserState((prev) => ({
      ...prev,
      trading: {
        ...prev.trading,
        tradingTableTabFilters: {
          ...prev.trading.tradingTableTabFilters,
          [filterId]: checked,
        },
      },
    }));
  };

  return (
    <Checkbox.Row>
      <Checkbox.Check
        id={filterId}
        checked={currentValue}
        onCheckedChange={handleChange}
        sizeVariant="xs"
      />
      <Checkbox.Label
        id={filterId}
        sizeVariant="xs"
        className="whitespace-nowrap"
      >
        {children}
      </Checkbox.Label>
    </Checkbox.Row>
  );
}

function ShowAllMarkets() {
  const { t } = useTranslation();

  return (
    <CheckboxFilter filterId="showAllMarkets">
      {t(($) => $.showAllMarkets)}
    </CheckboxFilter>
  );
}

function HideSmallBalances() {
  const { t } = useTranslation();

  return (
    <CheckboxFilter filterId="hideSmallBalances">
      {t(($) => $.hideSmallBalances)}
    </CheckboxFilter>
  );
}

export function TradingTableTabsFilterCheckbox() {
  const { displayFilter } = useTradingTableTabsFiltersContext();

  switch (displayFilter) {
    case 'showAllMarkets':
      return <ShowAllMarkets />;
    case 'hideSmallBalances':
      return <HideSmallBalances />;
    case undefined:
      return;
  }
}
