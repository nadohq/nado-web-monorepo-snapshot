import { DisclosureCard, LinkButton } from '@nadohq/web-ui';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';

interface Props {
  explorerUrl: string;
}

export function BridgeDisclosureCard({ explorerUrl }: Props) {
  const { t } = useTranslation();

  return (
    <DisclosureCard
      title={t(($) => $.bridgeDepositDisclosure.title)}
      description={
        <Trans
          i18nKey={($) => $.bridgeDepositDisclosure.description}
          components={{
            action: (
              <LinkButton
                as={Link}
                colorVariant="primary"
                href={explorerUrl}
                external
              />
            ),
          }}
        />
      }
    />
  );
}
