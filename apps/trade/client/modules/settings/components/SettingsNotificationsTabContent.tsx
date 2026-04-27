import { NotificationPositionSetting } from 'client/modules/settings/components/NotificationPositionSetting';
import { OrderNotificationsSetting } from 'client/modules/settings/components/OrderNotificationsSetting';

/**
 * Notifications tab content for the settings dialog.
 * Includes order notifications and notification position settings.
 */
export function SettingsNotificationsTabContent() {
  return (
    <>
      <OrderNotificationsSetting />
      <NotificationPositionSetting />
    </>
  );
}
