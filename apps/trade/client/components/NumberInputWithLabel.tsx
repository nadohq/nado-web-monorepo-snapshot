import { BaseTestProps, WithRef } from '@nadohq/web-common';
import { CompactInput, CompactInputProps, Input } from '@nadohq/web-ui';
import { useSanitizedNumericOnChange } from 'client/hooks/ui/form/useSanitizedNumericOnChange';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { DefinitionTooltipID } from 'client/modules/tooltips/DefinitionTooltip/definitionTooltipConfig';

interface Props extends WithRef<
  Omit<CompactInputProps & BaseTestProps, 'startElement'>,
  HTMLInputElement
> {
  label: string;
  definitionId?: DefinitionTooltipID;
}

export function NumberInputWithLabel({
  label,
  definitionId,
  id,
  onChange,
  dataTestId,
  ...rest
}: Props) {
  const handleChange = useSanitizedNumericOnChange(onChange);

  return (
    <CompactInput
      // Some browsers auto-coerce/validate type="number" and drop the intermediate states we sanitize, so we use text
      id={id}
      name={id}
      onChange={handleChange}
      dataTestId={dataTestId}
      startElement={
        <DefinitionTooltip
          definitionId={definitionId}
          // Ensure it doesn't render over the input.
          tooltipOptions={{ placement: 'bottom' }}
          asChild
        >
          <Input.Label className="text-xs" htmlFor={id}>
            {label}
          </Input.Label>
        </DefinitionTooltip>
      }
      textAreaClassName="text-right text-xs"
      {...rest}
    />
  );
}
