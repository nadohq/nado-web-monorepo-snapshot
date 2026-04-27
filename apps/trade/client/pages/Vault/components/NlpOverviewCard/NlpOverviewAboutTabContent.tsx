import { NLP_TOKEN_INFO, useNadoMetadataContext } from '@nadohq/react-client';
import { WithChildren } from '@nadohq/web-common';
import { IconComponent, Icons } from '@nadohq/web-ui';
import { NlpOverviewCardTabContent } from 'client/pages/Vault/components/NlpOverviewCard/components/NlpOverviewCardTabContent';
import { useTranslation } from 'react-i18next';

export function NlpOverviewAboutTabContent() {
  const { t } = useTranslation();
  const {
    primaryQuoteToken: { symbol: primaryQuoteTokenSymbol },
  } = useNadoMetadataContext();

  return (
    <NlpOverviewCardTabContent className="text-text-tertiary">
      <span>{t(($) => $.vault.nlpOverview.aboutTab.descriptionLabel)}</span>
      <p className="text-text-primary">
        {t(($) => $.vault.nlpOverview.aboutTab.protocolDescription, {
          tokenSymbol: NLP_TOKEN_INFO.symbol,
        })}
      </p>
      <p className="text-text-primary">
        {t(($) => $.vault.nlpOverview.aboutTab.betaCapNotice)}
      </p>
      {/*top padding ensures a larger gap between sections on mobile*/}
      <div className="mt-auto flex flex-col gap-y-2 pt-2">
        <Feature icon={Icons.ArrowDownLeft}>
          {t(($) => $.vault.nlpOverview.aboutTab.features.depositAndReceive, {
            quoteSymbol: primaryQuoteTokenSymbol,
            tokenSymbol: NLP_TOKEN_INFO.symbol,
          })}
        </Feature>
        <Feature icon={Icons.Sparkle}>
          {t(($) => $.vault.nlpOverview.aboutTab.features.countsTowardsMargin, {
            tokenSymbol: NLP_TOKEN_INFO.symbol,
          })}
        </Feature>
        <Feature icon={Icons.Coins}>
          {t(($) => $.vault.nlpOverview.aboutTab.features.vaultEarnsYield)}
        </Feature>
        <Feature icon={Icons.ArrowUpRight}>
          {t(($) => $.vault.nlpOverview.aboutTab.features.burnToWithdraw, {
            tokenSymbol: NLP_TOKEN_INFO.symbol,
            quoteSymbol: primaryQuoteTokenSymbol,
          })}
        </Feature>
      </div>
    </NlpOverviewCardTabContent>
  );
}

function Feature({
  children,
  icon: Icon,
}: WithChildren<{ icon: IconComponent }>) {
  return (
    <div className="flex items-center gap-x-2">
      <Icon className="text-text-secondary h-4 w-auto" />
      {children}
    </div>
  );
}
