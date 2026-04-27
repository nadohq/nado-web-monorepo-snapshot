import { WithClassnames } from '@nadohq/web-common';
import { LinkButton } from '@nadohq/web-ui';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function UpcomingMaintenanceLink({ className }: WithClassnames) {
  const { t } = useTranslation();

  return (
    <LinkButton
      external
      as={Link}
      colorVariant="secondary"
      className={className}
      href={LINKS.maintenanceWindowDocs}
    >
      {t(($) => $.buttons.upcomingMaintenance)}
    </LinkButton>
  );
}
