import { MobileTradingSpreadsCard } from 'client/modules/tables/spreads/MobileTradingSpreadsCard';
import { useTradingSpreadsTable } from 'client/modules/tables/spreads/useTradingSpreadsTable';
import { MobileDataTabCards } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCards';

interface Props {
  productIds?: number[];
}

export function MobileTradingSpreadsTab({ productIds }: Props) {
  const { data: spreads, isLoading } = useTradingSpreadsTable({ productIds });

  return (
    <MobileDataTabCards
      emptyTablePlaceholderType="spreads"
      isLoading={isLoading}
      hasData={!!spreads?.length}
    >
      {spreads?.map((spread) => (
        <MobileTradingSpreadsCard key={spread.rowId} spread={spread} />
      ))}
    </MobileDataTabCards>
  );
}
