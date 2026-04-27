import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { Divider } from '@nadohq/web-ui';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { TwapExecutionsTable } from 'client/modules/trading/components/twap/TwapExecutionsDialog/components/TwapExecutionsTable';
import { useTwapExecutions } from 'client/modules/trading/components/twap/TwapExecutionsDialog/hooks/useTwapExecutions';
import { useTranslation } from 'react-i18next';

export interface TwapExecutionsDialogParams {
  digest: string;
}

export function TwapExecutionsDialog({ digest }: TwapExecutionsDialogParams) {
  const { hide } = useDialog();
  const { t } = useTranslation();

  const { data: executionsSummary, isLoading: isLoadingExecutionsSummary } =
    useTwapExecutions({ digest });

  const formatSpecifier = PresetNumberFormatSpecifier.NUMBER_INT;

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.twapExecutions)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <div className="grid grid-cols-2 gap-3">
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.total)}
            value={executionsSummary?.total}
            numberFormatSpecifier={formatSpecifier}
          />
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.executionStatus.executed)}
            value={executionsSummary?.executed}
            numberFormatSpecifier={formatSpecifier}
          />
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.executionStatus.pending)}
            value={executionsSummary?.pending}
            numberFormatSpecifier={formatSpecifier}
          />
          <ValueWithLabel.Horizontal
            sizeVariant="xs"
            label={t(($) => $.failedOrCancelled)}
            value={executionsSummary?.failedOrCancelled}
            numberFormatSpecifier={formatSpecifier}
          />
        </div>
        <Divider />
        <TwapExecutionsTable
          executions={executionsSummary?.executions}
          isLoading={isLoadingExecutionsSummary}
        />
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
