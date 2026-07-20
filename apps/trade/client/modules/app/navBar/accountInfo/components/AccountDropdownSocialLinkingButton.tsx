import {
  ButtonProps,
  Icons,
  LabelTooltip,
  SecondaryButton,
} from '@nadohq/web-ui';
import { useRequiresInitialDeposit } from 'client/hooks/subaccount/useRequiresInitialDeposit';
import { useSocialLinking } from 'client/modules/app/navBar/accountInfo/hooks/useSocialLinking';
import { useTranslation } from 'react-i18next';

export function AccountDropdownSocialLinkingButton() {
  const { t } = useTranslation();
  const { twitterAccount, connect, revoke, isConnecting, isRevoking } =
    useSocialLinking();
  const requiresInitialDeposit = useRequiresInitialDeposit();

  if (requiresInitialDeposit) {
    return null;
  }

  const { conditionalButtonProps, buttonLabelTooltipText, buttonText } =
    (() => {
      if (twitterAccount) {
        return {
          conditionalButtonProps: {
            onClick: revoke,
            isLoading: isRevoking,
            endIcon: <Icons.LinkBreak size={16} className="ml-auto" />,
          } satisfies ButtonProps,
          buttonLabelTooltipText: t(($) => $.buttons.disconnectXSocial),
          buttonText: twitterAccount.username,
        };
      }

      return {
        conditionalButtonProps: {
          onClick: connect,
          isLoading: isConnecting,
        } satisfies ButtonProps,
        buttonLabelTooltipText: t(($) => $.buttons.connectXSocial),
        buttonText: t(($) => $.buttons.connect),
      };
    })();

  return (
    <LabelTooltip label={buttonLabelTooltipText}>
      <SecondaryButton
        // Override horizontal padding to match the width of the other text content
        className="bg-surface-3 w-full px-2.5"
        startIcon={<Icons.XLogo />}
        {...conditionalButtonProps}
      >
        {buttonText}
      </SecondaryButton>
    </LabelTooltip>
  );
}
