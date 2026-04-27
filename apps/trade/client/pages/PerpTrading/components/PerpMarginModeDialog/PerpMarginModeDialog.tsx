import {
  DisclosureCard,
  PrimaryButton,
  SegmentedControl,
  Switch,
} from '@nadohq/web-ui';
import * as Tabs from '@radix-ui/react-tabs';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { PerpMarginModeCrossInfo } from 'client/modules/trading/components/PerpMarginModeCrossInfo';
import { PerpMarginModeIsolatedInfo } from 'client/modules/trading/components/PerpMarginModeIsolatedInfo';
import { usePerpMarginModeDialog } from 'client/pages/PerpTrading/components/PerpMarginModeDialog/usePerpMarginModeDialog';
import { useTranslation } from 'react-i18next';

export interface PerpMarginModeDialogParams {
  productId: number;
}

export function PerpMarginModeDialog({
  productId,
}: PerpMarginModeDialogParams) {
  const { t } = useTranslation();

  const {
    hide,
    enableIsoBorrows,
    isIsolatedOnly,
    marginModeTabs,
    onSaveClick,
    selectedMarginModeTabId,
    setEnableIsoBorrows,
    setSelectedMarginModeTabId,
  } = usePerpMarginModeDialog({ productId });

  const tabClassNames = 'flex flex-col gap-y-4 empty:hidden text-xs';

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.perpMarginMode)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <Tabs.Root
          className="flex flex-col gap-y-4"
          value={selectedMarginModeTabId}
          onValueChange={setSelectedMarginModeTabId}
        >
          <Tabs.List asChild>
            <SegmentedControl.Container>
              {marginModeTabs.map(({ id, label, disabled }) => {
                const isSelected = id === selectedMarginModeTabId;
                return (
                  <Tabs.Trigger value={id} key={id} asChild disabled={disabled}>
                    <SegmentedControl.Button
                      active={isSelected}
                      className="flex-1"
                      dataTestId={`perp-margin-mode-dialog-${id}-button`}
                      disabled={disabled}
                    >
                      {label}
                    </SegmentedControl.Button>
                  </Tabs.Trigger>
                );
              })}
            </SegmentedControl.Container>
          </Tabs.List>
          {isIsolatedOnly && (
            <DisclosureCard
              title={t(($) => $.perpMarginModeIsolatedOnlyDisclosure.title)}
              description={t(
                ($) => $.perpMarginModeIsolatedOnlyDisclosure.description,
              )}
            />
          )}
          <Tabs.Content
            value={'cross' satisfies MarginModeType}
            className={tabClassNames}
          >
            <PerpMarginModeCrossInfo />
          </Tabs.Content>
          <Tabs.Content
            value={'isolated' satisfies MarginModeType}
            className={tabClassNames}
          >
            <PerpMarginModeIsolatedInfo />
            <Switch.Row>
              <Switch.Label id="enableIsoBorrows">
                {t(($) => $.autoBorrow)}
              </Switch.Label>
              <Switch.Toggle
                dataTestId="perp-margin-mode-dialog-enable-iso-borrows-switch"
                id="enableIsoBorrows"
                checked={enableIsoBorrows}
                onCheckedChange={setEnableIsoBorrows}
              />
            </Switch.Row>
          </Tabs.Content>
        </Tabs.Root>
        <PrimaryButton
          onClick={onSaveClick}
          dataTestId="perp-margin-mode-dialog-confirm-button"
        >
          {t(($) => $.buttons.confirm)}
        </PrimaryButton>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
