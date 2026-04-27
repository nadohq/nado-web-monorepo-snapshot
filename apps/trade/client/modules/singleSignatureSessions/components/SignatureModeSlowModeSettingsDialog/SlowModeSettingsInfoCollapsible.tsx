import {
  SEQUENCER_FEE_AMOUNT_USDT,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { DiscList } from '@nadohq/web-ui';
import { CollapsibleInfoCard } from 'client/components/CollapsibleInfoCard';
import { Trans, useTranslation } from 'react-i18next';

export function SlowModeSettingsInfoCollapsible() {
  const { t } = useTranslation();
  const {
    primaryQuoteToken: { symbol: primaryQuoteTokenSymbol },
  } = useNadoMetadataContext();

  const collapsibleContent = (
    <div className="flex flex-col gap-y-2">
      <p>{t(($) => $.smartContractWalletRequirement)}</p>
      <DiscList.Container>
        <DiscList.Item>
          <Trans
            i18nKey={($) => $.generatePrivateKeyInstruction}
            components={{
              highlight: <span className="text-text-primary font-bold" />,
            }}
          />
        </DiscList.Item>
        <DiscList.Item>
          <Trans
            i18nKey={($) => $.oneClickTradingFeeDescription}
            values={{
              primaryQuoteTokenSymbol,
              feeAmount: SEQUENCER_FEE_AMOUNT_USDT,
            }}
            components={{
              highlight: <span className="text-text-primary font-bold" />,
            }}
          />
        </DiscList.Item>
      </DiscList.Container>
    </div>
  );

  return (
    <CollapsibleInfoCard
      title={t(($) => $.instructions)}
      collapsibleContent={collapsibleContent}
      isInitialOpen
    />
  );
}
