import { WithChildren, WithClassnames } from '@nadohq/web-common';
import { Icons } from '@nadohq/web-ui';
import { Header } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { DefinitionTooltipID } from 'client/modules/tooltips/DefinitionTooltip/definitionTooltipConfig';

interface Props<T> extends WithClassnames, WithChildren {
  header: Header<T, any>;
  definitionTooltipId: DefinitionTooltipID;
}

export function CalculatorIconHeaderCell<T>({
  header,
  definitionTooltipId,
}: Props<T>) {
  return (
    <HeaderCell header={header} className="flex justify-end">
      <DefinitionTooltip
        definitionId={definitionTooltipId}
        tooltipOptions={{ interactive: true, delayHide: 300 }}
        contentWrapperClassName="text-disabled hover:text-text-tertiary"
      >
        <Icons.MathOperationsBold size={16} />
      </DefinitionTooltip>
    </HeaderCell>
  );
}
