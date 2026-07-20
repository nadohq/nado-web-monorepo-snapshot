'use client';

import { LinkButton } from '@nadohq/web-ui';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function StatsLinkButton() {
  const { t } = useTranslation();

  return (
    <LinkButton
      colorVariant="secondary"
      as={Link}
      href={LINKS.statsDashboard}
      className="text-sm"
      external
      withExternalIcon
    >
      {t(($) => $.statsDashboard)}
    </LinkButton>
  );
}
