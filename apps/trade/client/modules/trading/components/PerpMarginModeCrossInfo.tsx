import { DiscList } from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';

export function PerpMarginModeCrossInfo() {
  const { t } = useTranslation();

  return (
    <DiscList.Container>
      <DiscList.Item>
        {t(($) => $.perpMarginModeCrossInfo.sharedMargin)}
      </DiscList.Item>
      <DiscList.Item>
        {t(($) => $.perpMarginModeCrossInfo.adjustLeverageScale)}
      </DiscList.Item>
      <DiscList.Item>
        {t(($) => $.perpMarginModeCrossInfo.leverageAdjustmentNoEffect)}
      </DiscList.Item>
    </DiscList.Container>
  );
}
