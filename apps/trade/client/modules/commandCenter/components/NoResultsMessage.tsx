import { WithClassnames, joinClassNames } from '@nadohq/web-common';
import { Command } from 'cmdk';
import { useTranslation } from 'react-i18next';

export function NoResultsMessage({ className }: WithClassnames) {
  const { t } = useTranslation();

  return (
    <Command.Empty
      className={joinClassNames(
        'text-text-tertiary flex items-center justify-center px-10 text-center text-xs',
        className,
      )}
      asChild
    >
      <p>{t(($) => $.emptyPlaceholders.noSearchResultsFound)}</p>
    </Command.Empty>
  );
}
