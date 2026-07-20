import { TextButton } from '@nadohq/web-ui';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import { useResetTradingGridLayout } from 'client/modules/trading/layout/hooks/useResetTradingGridLayout';
import { useTranslation } from 'react-i18next';

export function ResetGridLayoutSetting() {
  const { t } = useTranslation();
  const { resetGridLayout } = useResetTradingGridLayout();

  return (
    <SettingWithLabel
      labelContent={t(($) => $.tradingGridLayout)}
      controlContent={
        <TextButton colorVariant="secondary" onClick={resetGridLayout}>
          {t(($) => $.buttons.reset)}
        </TextButton>
      }
    />
  );
}
