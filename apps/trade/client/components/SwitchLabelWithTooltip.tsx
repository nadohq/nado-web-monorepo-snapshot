import { WithClassnames } from '@nadohq/web-common';
import {
  BaseDefinitionTooltipDecoration,
  Switch,
  SwitchLabelProps,
} from '@nadohq/web-ui';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { DefinitionTooltipID } from 'client/modules/tooltips/DefinitionTooltip/definitionTooltipConfig';

interface Props extends WithClassnames<SwitchLabelProps> {
  definitionId: DefinitionTooltipID;
  decoration?: BaseDefinitionTooltipDecoration;
}

export function SwitchLabelWithTooltip({
  children,
  definitionId,
  decoration,
  className,
  ...props
}: Props) {
  return (
    <Switch.Label {...props}>
      <DefinitionTooltip
        definitionId={definitionId}
        contentWrapperClassName={className}
        decoration={decoration}
      >
        {children}
      </DefinitionTooltip>
    </Switch.Label>
  );
}
