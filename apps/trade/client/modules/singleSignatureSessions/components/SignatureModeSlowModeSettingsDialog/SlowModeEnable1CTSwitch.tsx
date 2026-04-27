import { Switch } from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';

interface Props {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

export function SlowModeEnable1CTSwitch({ checked, onCheckedChange }: Props) {
  const { t } = useTranslation();

  return (
    <Switch.Row>
      <Switch.Label id="enable-1ct">
        {t(($) => $.buttons.enableOneClickTrading)}
      </Switch.Label>
      <Switch.Toggle
        id="enable-1ct"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </Switch.Row>
  );
}
