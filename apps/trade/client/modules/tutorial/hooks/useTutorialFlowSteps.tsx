import { useNadoMetadataContext } from '@nadohq/react-client';
import { LinkButton } from '@nadohq/web-ui';
import { UserTutorialFlowStepID } from 'client/modules/localstorage/userState/types/userTutorialFlowTypes';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { ReactNode, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export interface UserTutorialFlowStep {
  id: UserTutorialFlowStepID;
  triggerLabel: string;
  actionLabel: string;
  description: ReactNode;
}

export function useTutorialFlowSteps() {
  const { t } = useTranslation();

  const {
    primaryChainEnvMetadata: { chainName },
  } = useNadoMetadataContext();

  return useMemo((): UserTutorialFlowStep[] => {
    return [
      {
        id: 'get_started_on_ink',
        triggerLabel: t(($) => $.tutorialSteps.getStartedOnChain.triggerLabel, {
          chainName,
        }),
        actionLabel: t(($) => $.tutorialSteps.getStartedOnChain.actionLabel, {
          chainName,
        }),
        description: (
          <Trans
            i18nKey={($) => $.tutorialSteps.getStartedOnChain.description}
            values={{ chainName }}
            components={{
              action: (
                <LinkButton
                  colorVariant="secondary"
                  as={Link}
                  href={LINKS.tutorialAddInk}
                  external
                />
              ),
            }}
          />
        ),
      },
      {
        id: 'deposit',
        triggerLabel: t(($) => $.buttons.deposit),
        actionLabel: t(($) => $.buttons.deposit),
        description: (
          <Trans
            i18nKey={($) => $.tutorialSteps.deposit.description}
            components={{
              action: (
                <LinkButton
                  colorVariant="secondary"
                  external
                  as={Link}
                  href={LINKS.tutorialBridge}
                />
              ),
            }}
          />
        ),
      },
      {
        id: 'enable_1ct',
        triggerLabel: t(($) => $.tutorialSteps.enable1ct.triggerLabel),
        actionLabel: t(($) => $.tutorialSteps.enable1ct.actionLabel),
        description: <p>{t(($) => $.tutorialSteps.enable1ct.description)}</p>,
      },
      {
        id: 'set_trading_preferences',
        triggerLabel: t(
          ($) => $.tutorialSteps.setTradingPreferences.triggerLabel,
        ),
        actionLabel: t(($) => $.buttons.customize),
        description: (
          <p>{t(($) => $.tutorialSteps.setTradingPreferences.description)}</p>
        ),
      },
    ];
  }, [chainName, t]);
}
