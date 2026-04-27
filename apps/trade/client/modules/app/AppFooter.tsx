'use client';

import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { Icons, TextButton } from '@nadohq/web-ui';
import { AppVersion } from 'client/modules/app/components/AppVersion';
import { LatencyMonitor } from 'client/modules/app/components/LatencyMonitor';
import { StatusButton } from 'client/modules/app/components/StatusButton';
import { UpcomingMaintenanceAlert } from 'client/modules/app/components/UpcomingMaintenanceAlert';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { TutorialFlowPopover } from 'client/modules/tutorial/components/TutorialFlowPopover';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function AppFooter({ className }: WithClassnames) {
  const { t } = useTranslation();
  const { show } = useDialog();

  return (
    <div
      className={joinClassNames(
        'bg-background px-4',
        'h-footer border-overlay-divider border-t',
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-x-4 text-xs">
        <StatusButton />
        <TextButton
          colorVariant="secondary"
          startIcon={<Icons.Question />}
          onClick={() => show({ type: 'help_center', params: {} })}
        >
          {t(($) => $.buttons.getHelp)}
        </TextButton>
        <TutorialFlowPopover />
        <TextButton
          colorVariant="secondary"
          startIcon={<Icons.HandWaving />}
          as={Link}
          href={LINKS.zendeskAlphaFeedback}
          external
        >
          {t(($) => $.buttons.feedback)}
        </TextButton>
      </div>
      <div className="flex items-center gap-x-2 text-xs">
        <AppVersion />
        <LatencyMonitor />
        <UpcomingMaintenanceAlert />
      </div>
    </div>
  );
}
