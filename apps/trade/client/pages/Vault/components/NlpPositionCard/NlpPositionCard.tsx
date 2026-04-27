'use client';

import {
  NLP_TOKEN_INFO,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import {
  LinkButton,
  PrimaryButton,
  SecondaryButton,
  SectionedCard,
} from '@nadohq/web-ui';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { ROUTES } from 'client/modules/app/consts/routes';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useNlpPositionCard } from 'client/pages/Vault/components/NlpPositionCard/useNlpPositionCard';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function NlpPositionCard() {
  const { t } = useTranslation();
  const { show } = useDialog();
  const isConnected = useIsConnected();
  const { balanceValueUsd, balanceAmount, cumulativePnlUsd, unrealizedPnlUsd } =
    useNlpPositionCard();

  return (
    <SectionedCard>
      <SectionedCard.Header className="flex justify-between">
        {t(($) => $.yourPosition)}
        <LinkButton
          colorVariant="secondary"
          as={Link}
          href={ROUTES.portfolio.history}
          className="text-xs"
        >
          {t(($) => $.buttons.seeHistory)}
        </LinkButton>
      </SectionedCard.Header>
      <SectionedCard.Content className="flex flex-col gap-y-4">
        <ValueWithLabel.Vertical
          label={t(($) => $.position)}
          value={balanceValueUsd}
          numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
          dataTestId="nlp-position-card-position-value"
        />
        <ValueWithLabel.Vertical
          label={t(($) => $.balance)}
          value={balanceAmount}
          numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
          valueEndElement={NLP_TOKEN_INFO.symbol}
          dataTestId="nlp-position-card-balance-value"
        />
        <ValueWithLabel.Vertical
          label={t(($) => $.allTimeEarned)}
          value={cumulativePnlUsd}
          numberFormatSpecifier={
            PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP
          }
          valueClassName={getSignDependentColorClassName(cumulativePnlUsd)}
          dataTestId="nlp-position-card-cumulative-pnl-value"
        />
        <ValueWithLabel.Vertical
          label={t(($) => $.unrealizedPnl)}
          value={unrealizedPnlUsd}
          numberFormatSpecifier={
            PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP
          }
          valueClassName={getSignDependentColorClassName(unrealizedPnlUsd)}
          dataTestId="nlp-position-card-unrealized-pnl-value"
        />
        <div className="mt-auto grid grid-cols-2 gap-x-2">
          <PrimaryButton
            disabled={!isConnected}
            onClick={() => {
              show({
                type: 'deposit_nlp_liquidity',
                params: {},
              });
            }}
            dataTestId="nlp-position-card-deposit-button"
          >
            {t(($) => $.buttons.deposit)}
          </PrimaryButton>
          <SecondaryButton
            disabled={!isConnected || !balanceAmount?.gt(0)}
            onClick={() => {
              show({
                type: 'withdraw_nlp_liquidity',
                params: {},
              });
            }}
            dataTestId="nlp-position-card-withdraw-button"
          >
            {t(($) => $.buttons.withdraw)}
          </SecondaryButton>
        </div>
      </SectionedCard.Content>
    </SectionedCard>
  );
}
