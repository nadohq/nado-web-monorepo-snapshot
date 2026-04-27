import { SegmentedControl } from '@nadohq/web-ui';
import { IsolatedAdjustMarginMode } from 'client/modules/trading/hooks/useIsolatedAdjustMarginForm/types';
import { useTranslation } from 'react-i18next';

interface Props {
  isAddMargin: boolean;
  onAdjustmentModeChange: (mode: IsolatedAdjustMarginMode) => void;
}
export function IsolatedAdjustMarginModeControl({
  isAddMargin,
  onAdjustmentModeChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <SegmentedControl.Container className="grid grid-cols-2">
      <SegmentedControl.Button
        active={isAddMargin}
        onClick={() => onAdjustmentModeChange('add')}
      >
        {t(($) => $.buttons.add)}
      </SegmentedControl.Button>
      <SegmentedControl.Button
        active={!isAddMargin}
        onClick={() => onAdjustmentModeChange('remove')}
      >
        {t(($) => $.buttons.remove)}
      </SegmentedControl.Button>
    </SegmentedControl.Container>
  );
}
