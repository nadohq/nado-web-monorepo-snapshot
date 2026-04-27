import { useQueryIpBlockStatus } from '@nadohq/react-client';
import { GEOBLOCKED_COUNTRY_NAMES } from '@nadohq/web-common';
import { Card, LinkButton } from '@nadohq/web-ui';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { Fragment } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export function LocationRestrictedDialog() {
  const { t } = useTranslation();

  const { hide } = useDialog();
  const { data: ipBlockStatus } = useQueryIpBlockStatus();

  const canDismissDialog = ipBlockStatus === 'query_only';
  const onClose = canDismissDialog ? hide : undefined;

  return (
    <BaseAppDialog.Container onClose={onClose}>
      <BaseAppDialog.Title onClose={onClose}>
        {t(($) => $.dialogTitles.restrictedTerritory)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body className="text-xs">
        <p>{t(($) => $.sanctionedTerritoriesDescription)}</p>
        <CountriesCard countryNames={GEOBLOCKED_COUNTRY_NAMES.sanctioned} />
        <p>{t(($) => $.queryOnlyTerritoriesDescription)}</p>
        <CountriesCard countryNames={GEOBLOCKED_COUNTRY_NAMES.queryOnly} />
        <p>
          <Trans
            i18nKey={($) => $.termsReference}
            components={{
              termsofuselink: (
                <LinkButton
                  colorVariant="accent"
                  href={LINKS.termsOfUse}
                  as={Link}
                  external
                />
              ),
            }}
          />
        </p>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}

function CountriesCard({ countryNames }: { countryNames: string[] }) {
  return (
    <Card className="bg-surface-1">
      <p>
        {countryNames.map((name) => {
          return (
            <Fragment key={name}>
              {name}
              <br />
            </Fragment>
          );
        })}
      </p>
    </Card>
  );
}
