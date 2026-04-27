'use client';

import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { Icons, LabelTooltip } from '@nadohq/web-ui';
import { useQueryServerTime } from 'client/hooks/query/useQueryServerTime';
import { useTranslation } from 'react-i18next';

export function LatencyMonitor() {
  const { t } = useTranslation();
  const { data, isError, isLoading } = useQueryServerTime();

  const latencyMillis = data?.latencyMillis;
  const icon = (() => {
    if (isError || !latencyMillis) {
      return <Icons.CellSignalSlash size={16} className="text-negative" />;
    }
    if (latencyMillis > 1000) {
      return <Icons.CellSignalLow size={16} className="text-negative" />;
    }
    if (latencyMillis > 500) {
      return <Icons.CellSignalMedium size={16} className="text-warning" />;
    }
    return <Icons.CellSignalFull size={16} className="text-positive" />;
  })();

  const labelContent = (() => {
    if (isError) {
      return t(($) => $.errors.connectionError);
    }
    if (isLoading) {
      return t(($) => $.emptyPlaceholders.loading);
    }
    return t(($) => $.latencyValue, {
      latency: formatNumber(latencyMillis, {
        formatSpecifier: PresetNumberFormatSpecifier.NUMBER_INT,
      }),
    });
  })();

  return <LabelTooltip label={labelContent}>{icon}</LabelTooltip>;
}
