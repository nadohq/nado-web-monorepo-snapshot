import { joinClassNames } from '@nadohq/web-common';
import { Icons, SegmentedControl } from '@nadohq/web-ui';
import { useNotificationPosition } from 'client/modules/notifications/hooks/useNotificationPosition';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import {
  SETTINGS_ROW_HEIGHT,
  SETTINGS_SEGMENTED_CONTROL_BUTTON_CLASSNAMES,
  SETTINGS_SEGMENTED_CONTROL_CONTAINER_CLASSNAMES,
} from 'client/modules/settings/consts';
import { useTranslation } from 'react-i18next';

/**
 * Settings component for configuring toast notification position (left or right side of screen).
 */
export function NotificationPositionSetting() {
  const { t } = useTranslation();
  const { notificationPosition, setNotificationPosition } =
    useNotificationPosition();

  return (
    <SettingWithLabel
      labelContent={t(($) => $.notificationPosition)}
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
            active={notificationPosition === 'left'}
            onClick={() => setNotificationPosition('left')}
          >
            <Icons.AlignLeftSimple size={16} />
          </SegmentedControl.Button>
          <SegmentedControl.Button
            className={
              SETTINGS_SEGMENTED_CONTROL_BUTTON_CLASSNAMES.verticalPadding
            }
            active={notificationPosition === 'right'}
            onClick={() => setNotificationPosition('right')}
          >
            <Icons.AlignRightSimple size={16} />
          </SegmentedControl.Button>
        </SegmentedControl.Container>
      }
    />
  );
}
