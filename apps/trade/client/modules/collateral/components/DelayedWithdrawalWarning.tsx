import { LinkButton } from '@nadohq/web-ui';
import { WarningPanel } from 'client/components/WarningPanel';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';

export function DelayedWithdrawalWarning() {
  const { t } = useTranslation();

  return (
    <WarningPanel title={t(($) => $.possibleDelay)}>
      <p>
        <Trans
          i18nKey={($) => $.delayedWithdrawalExplanation}
          components={{
            highlight: <span className="text-text-primary" />,
          }}
        />
      </p>
      <LinkButton
        className="text-xs"
        external
        colorVariant="secondary"
        as={Link}
        href={LINKS.fastWithdrawalsLearnMore}
        withExternalIcon
      >
        {t(($) => $.buttons.learnMore)}
      </LinkButton>
    </WarningPanel>
  );
}
