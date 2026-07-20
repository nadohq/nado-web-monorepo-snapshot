import { LinkButton } from '@nadohq/web-ui';
import { UserDisclosureDismissibleCard } from 'client/components/UserDisclosureDismissibleCard';
import { DepositInfoCardType } from 'client/modules/collateral/deposit/types';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';

interface Props {
  displayedInfoCardType: DepositInfoCardType | undefined;
}

export function DepositInfoCard({ displayedInfoCardType }: Props) {
  const { t } = useTranslation();

  switch (displayedInfoCardType) {
    case 'xstocks':
      return (
        <UserDisclosureDismissibleCard
          disclosureKey="deposit_xstocks"
          title={t(($) => $.xStocksDepositDisclosure.title)}
          description={
            <Trans
              i18nKey={($) => $.xStocksDepositDisclosure.description}
              components={{
                action: (
                  <LinkButton
                    as={Link}
                    colorVariant="primary"
                    href={LINKS.xStocksDocs}
                    external
                  />
                ),
              }}
            />
          }
        />
      );
    case undefined:
      return null;
  }
}
