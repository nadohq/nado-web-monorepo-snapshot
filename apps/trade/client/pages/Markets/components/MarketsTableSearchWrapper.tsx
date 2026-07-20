import { SearchBox } from '@nadohq/web-ui';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  renderTable: ({ query }: { query: string }) => ReactElement;
}

export function MarketsTableSearchWrapper({ renderTable }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  return (
    <div className="flex flex-col gap-y-2">
      <SearchBox
        query={query}
        setQuery={setQuery}
        sizeVariant="xs"
        placeholder={t(($) => $.marketsPage.searchMarkets)}
        className="lg:w-80"
      />
      {renderTable({ query })}
    </div>
  );
}
