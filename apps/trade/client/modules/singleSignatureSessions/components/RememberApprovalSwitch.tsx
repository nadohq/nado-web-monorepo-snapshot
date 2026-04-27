import { Switch } from '@nadohq/web-ui';
import { SwitchLabelWithTooltip } from 'client/components/SwitchLabelWithTooltip';
import { useTranslation } from 'react-i18next';

interface Props {
  checked: boolean;
  disabled?: boolean;

  onCheckedChange(checked: boolean): void;
}

export function RememberApprovalSwitch({
  checked,
  disabled,
  onCheckedChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <Switch.Row disabled={disabled}>
      <SwitchLabelWithTooltip
        id="remember-approval"
        definitionId="octRememberApproval"
      >
        {t(($) => $.buttons.rememberApproval)}
      </SwitchLabelWithTooltip>
      <Switch.Toggle
        id="remember-approval"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </Switch.Row>
  );
}
