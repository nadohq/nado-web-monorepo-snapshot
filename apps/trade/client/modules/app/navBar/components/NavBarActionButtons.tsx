import { Icons, TextButton } from '@nadohq/web-ui';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { LanguageSelectorDropdown } from 'client/modules/app/navBar/components/LanguageSelectorDropdown';
import { useEnabledFeatures } from 'client/modules/envSpecificContent/hooks/useEnabledFeatures';
import { clientEnv } from 'common/environment/clientEnv';

interface NavBarActionButtonsProps {
  showDesktopActionButtons: boolean;
}

export function NavBarActionButtons({
  showDesktopActionButtons,
}: NavBarActionButtonsProps) {
  const { show, push } = useDialog();
  const { isNotifiEnabled } = useEnabledFeatures();
  const isConnected = useIsConnected();

  const canShowSettings = isConnected;
  const canShowNotifications = isNotifiEnabled && isConnected;
  const canShowMobileConnect = showDesktopActionButtons && isConnected;
  const canShowLanguageSelector = clientEnv.base.enableExperimentalFeatures;

  return (
    <>
      {showDesktopActionButtons && (
        <TextButton
          className="p-2.5"
          colorVariant="secondary"
          startIcon={<Icons.MagnifyingGlass size={20} />}
          onClick={() => show({ type: 'command_center', params: {} })}
        />
      )}
      {canShowLanguageSelector && <LanguageSelectorDropdown />}
      {canShowNotifications && (
        <TextButton
          className="p-2.5"
          colorVariant="secondary"
          startIcon={<Icons.BellSimple size={20} />}
          onClick={() => show({ type: 'notifi_settings', params: {} })}
        />
      )}
      {canShowMobileConnect && (
        <TextButton
          className="p-2.5"
          colorVariant="secondary"
          startIcon={<Icons.Devices size={20} />}
          onClick={() =>
            push({
              type: 'generate_desktop_wallet_link_qr_code',
              params: {},
            })
          }
        />
      )}
      {canShowSettings && (
        <TextButton
          className="p-2.5"
          colorVariant="secondary"
          startIcon={<Icons.GearSix size={20} />}
          onClick={() => show({ type: 'settings', params: {} })}
        />
      )}
    </>
  );
}
