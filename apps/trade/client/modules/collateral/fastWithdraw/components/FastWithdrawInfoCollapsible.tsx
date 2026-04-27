import { DiscList, LinkButton } from '@nadohq/web-ui';
import { CollapsibleInfoCard } from 'client/components/CollapsibleInfoCard';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function FastWithdrawInfoCollapsible() {
  const { t } = useTranslation();

  const collapsibleContent = (
    <div className="flex flex-col items-start gap-y-4">
      <DiscList.Container>
        <DiscList.Item>{t(($) => $.fastWithdrawals.skipQueue)}</DiscList.Item>
        <DiscList.Item>
          {t(($) => $.fastWithdrawals.liquidityConstraint)}
        </DiscList.Item>
      </DiscList.Container>
      <LinkButton
        colorVariant="secondary"
        as={Link}
        href={LINKS.fastWithdrawalsLearnMore}
        external
        withExternalIcon
      >
        {t(($) => $.buttons.learnMore)}
      </LinkButton>
    </div>
  );

  return (
    <CollapsibleInfoCard
      title={t(($) => $.details)}
      isInitialOpen
      collapsibleContent={collapsibleContent}
    />
  );
}
