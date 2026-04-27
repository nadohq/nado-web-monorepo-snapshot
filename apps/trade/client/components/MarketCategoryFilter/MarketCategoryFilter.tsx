import { ScrollShadowsContainer, TabButton } from '@nadohq/web-ui';
import * as RadioGroup from '@radix-ui/react-radio-group';
import {
  useMarketCategoryFilter,
  UseMarketCategoryFilterParams,
} from 'client/components/MarketCategoryFilter/useMarketCategoryFilter';

interface Props extends UseMarketCategoryFilterParams {}

export function MarketCategoryFilter({
  marketCategory,
  setMarketCategory,
}: Props) {
  const {
    marketCategoryFilterById,
    selectedMarketCategoryId,
    setSelectedMarketCategoryId,
  } = useMarketCategoryFilter({
    marketCategory,
    setMarketCategory,
  });

  return (
    <RadioGroup.Root
      onValueChange={setSelectedMarketCategoryId}
      value={selectedMarketCategoryId}
    >
      <ScrollShadowsContainer
        orientation="horizontal"
        className="flex items-center gap-x-1"
      >
        {Object.entries(marketCategoryFilterById).map(([id, { label }]) => {
          return (
            <RadioGroup.Item key={id} value={id} asChild>
              <TabButton
                className="text-xs"
                active={selectedMarketCategoryId === id}
                dataTestId={`trading-market-switcher-category-filter-${label.toLowerCase()}`}
              >
                {label}
              </TabButton>
            </RadioGroup.Item>
          );
        })}
      </ScrollShadowsContainer>
    </RadioGroup.Root>
  );
}
