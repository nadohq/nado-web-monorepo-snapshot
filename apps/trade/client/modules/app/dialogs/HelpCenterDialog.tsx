import { ExternalNavCardButton, Icons } from '@nadohq/web-ui';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function HelpCenterDialog() {
  const { t } = useTranslation();
  const { hide } = useDialog();

  const handleLinkClick = (external: boolean) => {
    if (!external) {
      hide();
    }
  };

  const faqLinks = useMemo(() => {
    return {
      faq: {
        href: LINKS.faq,
        external: true,
        title: t(($) => $.helpCenter.faq.title),
        description: t(($) => $.helpCenter.faq.description),
        icon: Icons.FileText,
      },
      tutorials: {
        href: LINKS.onboardingTutorial,
        external: true,
        title: t(($) => $.helpCenter.tutorials.title),
        description: t(($) => $.helpCenter.tutorials.description),
        icon: Icons.NavigationArrowFill,
      },
      zenDesk: {
        href: LINKS.zendesk,
        external: true,
        title: t(($) => $.helpCenter.zenDesk.title),
        description: t(($) => $.helpCenter.zenDesk.description),
        icon: Icons.Question,
      },
    };
  }, [t]);

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.helpCenter)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        {Object.values(faqLinks).map(
          ({ title, href, external, description, icon }) => {
            return (
              <ExternalNavCardButton
                as={Link}
                key={title}
                href={href}
                title={title}
                external={external}
                description={description}
                icon={icon}
                onClick={() => handleLinkClick(external)}
              />
            );
          },
        )}
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
