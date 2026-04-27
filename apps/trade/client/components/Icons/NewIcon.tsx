import { WithClassnames } from '@nadohq/web-common';
import { Icons, LabelTooltip } from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';

export function NewIcon({ className }: WithClassnames) {
  const { t } = useTranslation();

  return (
    <LabelTooltip
      label={t(($) => $.newMarket)}
      contentWrapperClassName={className}
    >
      <Icons.SparkleFill className="text-positive" />
    </LabelTooltip>
  );
}
