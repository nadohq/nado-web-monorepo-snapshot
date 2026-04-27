import { joinClassNames } from '@nadohq/web-common';
import { Icons, SegmentedControl } from '@nadohq/web-ui';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import {
  SETTINGS_ROW_HEIGHT,
  SETTINGS_SEGMENTED_CONTROL_BUTTON_CLASSNAMES,
  SETTINGS_SEGMENTED_CONTROL_CONTAINER_CLASSNAMES,
} from 'client/modules/settings/consts';
import { useTradingConsolePosition } from 'client/modules/trading/hooks/useTradingConsolePosition';
import { useTranslation } from 'react-i18next';

export function TradingConsolePositionSetting() {
  const { t } = useTranslation();

  const { consolePosition, setConsolePosition } = useTradingConsolePosition();

  return (
    <SettingWithLabel
      labelContent={t(($) => $.tradingConsoleLocation)}
      controlContent={
        <SegmentedControl.Container
          className={joinClassNames(
            'grid grid-cols-2',
            SETTINGS_SEGMENTED_CONTROL_CONTAINER_CLASSNAMES.width,
            SETTINGS_ROW_HEIGHT,
          )}
        >
          <SegmentedControl.Button
            className={
              SETTINGS_SEGMENTED_CONTROL_BUTTON_CLASSNAMES.verticalPadding
            }
            active={consolePosition === 'left'}
            onClick={() => setConsolePosition('left')}
          >
            <Icons.SidebarSimple size={16} />
          </SegmentedControl.Button>
          <SegmentedControl.Button
            className={
              SETTINGS_SEGMENTED_CONTROL_BUTTON_CLASSNAMES.verticalPadding
            }
            active={consolePosition === 'right'}
            onClick={() => setConsolePosition('right')}
          >
            <Icons.SidebarSimple className="rotate-180" size={16} />
          </SegmentedControl.Button>
        </SegmentedControl.Container>
      }
    />
  );
}
