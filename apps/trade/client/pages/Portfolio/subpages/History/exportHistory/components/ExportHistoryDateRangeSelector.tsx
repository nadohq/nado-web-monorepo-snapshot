import { SecondaryButton } from '@nadohq/web-ui';
import { DateInput } from 'client/components/DateInput/DateInput';
import { useTranslation } from 'react-i18next';

interface ExportHistoryDateRangeSelectorProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  nowDate: Date | undefined;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onLastWeekClick: () => void;
  onLastMonthClick: () => void;
  onLastYearClick: () => void;
}

export function ExportHistoryDateRangeSelector({
  startDate,
  endDate,
  nowDate,
  onStartDateChange,
  onEndDateChange,
  onLastWeekClick,
  onLastMonthClick,
  onLastYearClick,
}: ExportHistoryDateRangeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-y-2">
      <DateInput
        triggerLabel={t(($) => $.startDate)}
        triggerPlaceholderText={t(($) => $.inputPlaceholders.chooseStartDate)}
        value={startDate}
        onChange={onStartDateChange}
        maxDate={endDate ?? nowDate}
      />
      <DateInput
        triggerLabel={t(($) => $.endDate)}
        triggerPlaceholderText={t(($) => $.inputPlaceholders.chooseEndDate)}
        value={endDate}
        onChange={onEndDateChange}
        minDate={startDate}
        maxDate={nowDate}
      />
      <div className="grid grid-cols-3 gap-x-2">
        <SecondaryButton size="xs" onClick={onLastWeekClick}>
          {t(($) => $.buttons.lastWeek)}
        </SecondaryButton>
        <SecondaryButton size="xs" onClick={onLastMonthClick}>
          {t(($) => $.buttons.lastMonth)}
        </SecondaryButton>
        <SecondaryButton size="xs" onClick={onLastYearClick}>
          {t(($) => $.buttons.lastYear)}
        </SecondaryButton>
      </div>
    </div>
  );
}
