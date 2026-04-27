import { Checkbox } from '@nadohq/web-ui';
import { CheckboxLabelWithTooltip } from 'client/components/CheckboxLabelWithTooltip';
import { useTranslation } from 'react-i18next';

interface Props {
  showTpSlCheckbox: boolean;
  isTpSlCheckboxChecked: boolean;
  setIsTpSlCheckboxChecked: (isChecked: boolean) => void;
  isTpSlCheckboxDisabled: boolean;
}

export function TpSlCheckbox({
  showTpSlCheckbox,
  isTpSlCheckboxChecked,
  setIsTpSlCheckboxChecked,
  isTpSlCheckboxDisabled,
}: Props) {
  const { t } = useTranslation();

  if (!showTpSlCheckbox) {
    return null;
  }

  return (
    <Checkbox.Row>
      <Checkbox.Check
        id="tpsl"
        checked={isTpSlCheckboxChecked}
        onCheckedChange={setIsTpSlCheckboxChecked}
        sizeVariant="xs"
        disabled={isTpSlCheckboxDisabled}
        dataTestId="order-settings-tpsl-checkbox"
      />
      <CheckboxLabelWithTooltip
        id="tpsl"
        definitionId="perpPositionsTpSl"
        sizeVariant="xs"
      >
        {t(($) => $.tpSl)}
      </CheckboxLabelWithTooltip>
    </Checkbox.Row>
  );
}
