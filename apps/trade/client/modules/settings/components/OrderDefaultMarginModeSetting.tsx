import { joinClassNames } from '@nadohq/web-common';
import { SegmentedControl } from '@nadohq/web-ui';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import {
  SETTINGS_ROW_HEIGHT,
  SETTINGS_SEGMENTED_CONTROL_BUTTON_CLASSNAMES,
} from 'client/modules/settings/consts';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function OrderDefaultMarginModeSetting() {
  const { t } = useTranslation();

  const { savedUserState, setSavedUserState } = useSavedUserState();

  const defaultMarginMode = savedUserState.trading.marginMode.default;

  const setDefaultMarginMode = useCallback(
    (defaultMode: MarginModeType) =>
      setSavedUserState((prev) => {
        prev.trading.marginMode.default = defaultMode;
        return prev;
      }),
    [setSavedUserState],
  );

  return (
    <SettingWithLabel
      definitionId="settingsDefaultMarginMode"
      labelContent={t(($) => $.defaultMarginMode)}
      controlContent={
        <SegmentedControl.Container
          className={joinClassNames(
            'grid w-42 grid-cols-2',
            SETTINGS_ROW_HEIGHT,
          )}
        >
          <SegmentedControl.Button
            className={
              SETTINGS_SEGMENTED_CONTROL_BUTTON_CLASSNAMES.verticalPadding
            }
            active={defaultMarginMode === 'cross'}
            onClick={() => setDefaultMarginMode('cross')}
          >
            {t(($) => $.cross)}
          </SegmentedControl.Button>
          <SegmentedControl.Button
            className={
              SETTINGS_SEGMENTED_CONTROL_BUTTON_CLASSNAMES.verticalPadding
            }
            active={defaultMarginMode === 'isolated'}
            onClick={() => setDefaultMarginMode('isolated')}
          >
            {t(($) => $.isolated)}
          </SegmentedControl.Button>
        </SegmentedControl.Container>
      }
    />
  );
}
