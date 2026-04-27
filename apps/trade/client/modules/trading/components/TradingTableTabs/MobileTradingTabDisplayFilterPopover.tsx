import { joinClassNames } from '@nadohq/web-common';
import { Button, DropdownUi, Icons } from '@nadohq/web-ui';
import {
  PopoverContent,
  Root as PopoverRoot,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { TradingTableTabsFilterCheckbox } from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/TradingTableTabsFilters';
import { useTradingTableTabsFilters } from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/useTradingTableTabsFilters';
import { useState } from 'react';

export function MobileTradingTabDisplayFilterPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { displayFilter, hideSmallBalances, visibleProductIds } =
    useTradingTableTabsFilters();

  const isDisplayFilterActive = (() => {
    switch (displayFilter) {
      case 'hideSmallBalances':
        return hideSmallBalances;
      case 'showAllMarkets':
        return visibleProductIds && visibleProductIds.length > 0;
      case undefined:
        return false;
    }
  })();

  const FilterIcon = isDisplayFilterActive
    ? Icons.FunnelSimpleX
    : Icons.FunnelSimple;

  return (
    <PopoverRoot open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <PopoverTrigger asChild>
        <Button
          className={joinClassNames(
            'px-2',
            isDisplayFilterActive && 'text-text-primary',
          )}
        >
          <FilterIcon size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent asChild align="end" sideOffset={8}>
        <DropdownUi.Content className="p-3">
          <TradingTableTabsFilterCheckbox />
        </DropdownUi.Content>
      </PopoverContent>
    </PopoverRoot>
  );
}
