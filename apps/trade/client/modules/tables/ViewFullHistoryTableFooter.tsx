import { Divider, LinkButton } from '@nadohq/web-ui';
import { ROUTES } from 'client/modules/app/consts/routes';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function ViewFullHistoryTableFooter() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <Divider />
      <LinkButton
        as={Link}
        className="text-xs no-underline"
        colorVariant="secondary"
        href={ROUTES.portfolio.history}
      >
        {t(($) => $.buttons.viewFullHistory)}
      </LinkButton>
      <Divider />
    </div>
  );
}
