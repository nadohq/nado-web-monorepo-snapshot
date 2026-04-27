import { Header } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { CancelAllOrdersFilter } from 'client/hooks/execute/cancelOrder/useExecuteCancelAllOrders';
import { CancelAllOrdersDropdown } from 'client/modules/tables/components/CancelAllOrdersDropdown';

export function CancelAllOrdersHeaderCell<T>({
  cancelOrdersFilter,
  header,
}: {
  header: Header<T, any>;
  cancelOrdersFilter: CancelAllOrdersFilter;
}) {
  return (
    <HeaderCell header={header} className="flex justify-end">
      <CancelAllOrdersDropdown cancelOrdersFilter={cancelOrdersFilter} />
    </HeaderCell>
  );
}
