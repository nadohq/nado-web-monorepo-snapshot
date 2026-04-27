import { useEVMContext } from '@nadohq/react-client';
import {
  DiscList,
  LinkButton,
  PrimaryButton,
  ScrollShadowsContainer,
} from '@nadohq/web-ui';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';

export function TermsOfUseDialog() {
  const { t } = useTranslation();

  const { disconnect } = useEVMContext();
  const { hide, show } = useDialog();
  const { setSavedUserState } = useSavedUserState();

  const onClose = () => {
    // User has not agreed to the terms of use, so we need to disconnect them to force them to re-do the flow
    disconnect();
    hide();
  };

  const onAgreeToTerms = () => {
    setSavedUserState((prev) => {
      prev.onboardingComplete = true;
      return prev;
    });
    show({
      type: 'key_features',
      params: {},
    });
  };

  const termsOfUseContent = [
    t(($) => $.termsOfUseDialog.content.restrictedPerson),
    t(($) => $.termsOfUseDialog.content.noCurrentAccess),
    t(($) => $.termsOfUseDialog.content.noFutureAccess),
    t(($) => $.termsOfUseDialog.content.noVpn),
    t(($) => $.termsOfUseDialog.content.lawfulAccess),
    t(($) => $.termsOfUseDialog.content.risksAcknowledgment),
  ];

  return (
    <BaseAppDialog.Container onClose={onClose}>
      <BaseAppDialog.Title onClose={onClose}>
        {t(($) => $.dialogTitles.termsOfUse)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <p>
          <Trans
            i18nKey={($) => $.termsOfUseDialog.agreementText}
            components={{
              termsofuselink: (
                <LinkButton
                  external
                  as={Link}
                  colorVariant="accent"
                  href={LINKS.termsOfUse}
                />
              ),
              privacypolicylink: (
                <LinkButton
                  external
                  as={Link}
                  colorVariant="accent"
                  href={LINKS.privacyPolicy}
                />
              ),
            }}
          />
        </p>
        <div className="flex flex-col gap-y-3">
          <p>{t(($) => $.termsOfUseDialog.warrantSubtitle)}</p>
          <ScrollShadowsContainer className="text-text-tertiary bg-surface-1 flex max-h-56 rounded-sm p-4">
            <DiscList.Container className="h-max text-xs">
              {termsOfUseContent.map((name) => {
                return <DiscList.Item key={name}>{name}</DiscList.Item>;
              })}
            </DiscList.Container>
          </ScrollShadowsContainer>
        </div>
        <PrimaryButton
          onClick={onAgreeToTerms}
          dataTestId="terms-of-use-dialog-agree-to-terms-button"
        >
          {t(($) => $.buttons.agreeToTerms)}
        </PrimaryButton>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
