import { WithChildren, WithClassnames } from '@nadohq/web-common';
import { Header } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { useTranslation } from 'react-i18next';

interface Props<T> extends WithClassnames, WithChildren {
  header: Header<T, any>;
  isInitial: boolean;
  // Label for the Margin sub-column. Defaults to "Margin"
  marginLabel?: string;
}

export function MarginWeightHeaderCell<T>({
  header,
  isInitial,
  marginLabel: marginLabelProp,
}: Props<T>) {
  const { t } = useTranslation();

  const weightLabel = isInitial
    ? t(($) => $.initialWeightAbbrev)
    : t(($) => $.maintenanceWeightAbbrev);
  const marginLabel = marginLabelProp ?? t(($) => $.margin);

  return (
    <HeaderCell header={header}>
      <div className="flex items-center gap-x-1.5">
        {weightLabel}
        <span className="text-text-tertiary text-base">/</span>
        {marginLabel}
      </div>
    </HeaderCell>
  );
}
