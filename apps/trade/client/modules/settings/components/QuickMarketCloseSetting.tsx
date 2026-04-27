import { Switch } from '@nadohq/web-ui';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import { useEnableQuickMarketClose } from 'client/modules/trading/hooks/useEnableQuickMarketClose';
import { useTranslation } from 'react-i18next';

const TOGGLE_ID = 'quick-market-close';

export function QuickMarketCloseSetting() {
  const { t } = useTranslation();
  const { enableQuickMarketClose, setEnableQuickMarketClose } =
    useEnableQuickMarketClose();

  return (
    <SettingWithLabel
      definitionId="settingsQuickMarketClose"
      labelContent={
        <Switch.Label id={TOGGLE_ID} className="text-text-tertiary">
          {t(($) => $.quickMarketClose)}
        </Switch.Label>
      }
      controlContent={
        <Switch.Toggle
          id={TOGGLE_ID}
          checked={enableQuickMarketClose}
          onCheckedChange={setEnableQuickMarketClose}
        />
      }
    />
  );
}
