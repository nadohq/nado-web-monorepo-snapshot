import { Switch } from '@nadohq/web-ui';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import { useEnableClassicDepositUi } from 'client/modules/trading/hooks/useEnableClassicDepositUi';
import { useTranslation } from 'react-i18next';

const TOGGLE_ID = 'classic-deposit-ui';

export function ClassicDepositUiSetting() {
  const { t } = useTranslation();
  const { enableClassicDepositUi, setEnableClassicDepositUi } =
    useEnableClassicDepositUi();

  return (
    <SettingWithLabel
      definitionId="settingsClassicDepositUi"
      labelContent={
        <Switch.Label id={TOGGLE_ID} className="text-text-tertiary">
          {t(($) => $.classicDepositUi)}
        </Switch.Label>
      }
      controlContent={
        <Switch.Toggle
          id={TOGGLE_ID}
          checked={enableClassicDepositUi}
          onCheckedChange={setEnableClassicDepositUi}
        />
      }
    />
  );
}
