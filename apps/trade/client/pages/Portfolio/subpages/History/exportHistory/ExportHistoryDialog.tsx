import { WithChildren } from '@nadohq/web-common';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { ExportHistoryDateRangeSelector } from 'client/pages/Portfolio/subpages/History/exportHistory/components/ExportHistoryDateRangeSelector';
import { ExportHistorySubmitButton } from 'client/pages/Portfolio/subpages/History/exportHistory/components/ExportHistorySubmitButton';
import { ExportHistoryTypeSelect } from 'client/pages/Portfolio/subpages/History/exportHistory/components/ExportHistoryTypeSelect';
import { useExportHistoryDialog } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExportHistoryDialog';
import { ExportHistoryDialogParams } from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import { useTranslation } from 'react-i18next';

export function ExportHistoryDialog({
  initialExportType,
}: ExportHistoryDialogParams) {
  const { t } = useTranslation();

  const { hide } = useDialog();
  const {
    buttonState,
    endDate,
    nowDate,
    onLastMonthClick,
    onLastWeekClick,
    onLastYearClick,
    onSubmit,
    selectedExportType,
    setEndDate,
    setSelectedExportType,
    setStartDate,
    startDate,
    progressFrac,
  } = useExportHistoryDialog({ initialExportType });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.exportHistory)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <Section title={t(($) => $.historyType)}>
          <ExportHistoryTypeSelect
            selectedValue={selectedExportType}
            onSelectedValueChange={setSelectedExportType}
          />
        </Section>
        <Section title={t(($) => $.dateRange)}>
          <ExportHistoryDateRangeSelector
            startDate={startDate}
            endDate={endDate}
            nowDate={nowDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onLastWeekClick={onLastWeekClick}
            onLastMonthClick={onLastMonthClick}
            onLastYearClick={onLastYearClick}
          />
        </Section>
        <ExportHistorySubmitButton
          state={buttonState}
          progressFrac={progressFrac}
          onClick={onSubmit}
        />
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}

function Section({ children, title }: WithChildren<{ title: string }>) {
  return (
    <div className="flex flex-col gap-y-2">
      <span className="text-left">{title}</span>
      {children}
    </div>
  );
}
