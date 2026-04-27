import { LabelTooltip } from '@nadohq/web-ui';
import { TriggerOrderStatusInfo } from 'client/modules/trading/utils/trigger/getTriggerOrderStatusInfo';

interface Props {
  status: TriggerOrderStatusInfo;
}

export function TriggerOrderStatusDisplay({ status }: Props) {
  const { statusText, detailsText } = status;

  return detailsText ? (
    <LabelTooltip
      label={detailsText}
      tooltipContainerClassName="break-all"
      contentWrapperClassName="underline underline-offset-2 decoration-dashed decoration-disabled"
    >
      {statusText}
    </LabelTooltip>
  ) : (
    <>{statusText}</>
  );
}
