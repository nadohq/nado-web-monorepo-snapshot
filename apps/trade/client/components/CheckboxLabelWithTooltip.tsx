import { Checkbox, CheckboxLabelProps } from '@nadohq/web-ui';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { DefinitionTooltipID } from 'client/modules/tooltips/DefinitionTooltip/definitionTooltipConfig';

interface Props extends CheckboxLabelProps {
  definitionId: DefinitionTooltipID;
}

export function CheckboxLabelWithTooltip({
  children,
  definitionId,
  ...props
}: Props) {
  return (
    <Checkbox.Label {...props}>
      <DefinitionTooltip definitionId={definitionId}>
        {children}
      </DefinitionTooltip>
    </Checkbox.Label>
  );
}
