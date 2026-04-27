import { WithChildren, WithClassnames } from '@nadohq/web-common';
import { Header } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';

interface Props<T> extends WithClassnames, WithChildren {
  header: Header<T, any>;
}

export function TitleHeaderCell<T>({ className, header, children }: Props<T>) {
  return (
    <HeaderCell className={className} header={header}>
      <div className="text-text-primary text-sm">{children}</div>
    </HeaderCell>
  );
}
