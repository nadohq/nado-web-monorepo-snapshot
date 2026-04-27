import { NO_SPOT_CHAIN_ENVS } from 'client/modules/envSpecificContent/consts/noSpotChainEnvs';
import { RedirectOnInvalidChainEnvListener } from 'client/modules/envSpecificContent/RedirectOnInvalidChainEnvListener';
import { SpotTradingPage } from 'client/pages/SpotTrading/SpotTradingPage';
import { Metadata } from 'next';
import { getT } from 'server/i18n/i18n';

export default function Spot() {
  return (
    <>
      <RedirectOnInvalidChainEnvListener
        invalidChainEnvs={NO_SPOT_CHAIN_ENVS}
      />
      <SpotTradingPage />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t(($) => $.pageTitles.spot),
  };
}
