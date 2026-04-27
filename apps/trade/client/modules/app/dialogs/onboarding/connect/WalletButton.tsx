import {
  BaseTestProps,
  joinClassNames,
  WithClassnames,
} from '@nadohq/web-common';
import { SecondaryButton } from '@nadohq/web-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames, BaseTestProps {
  /**
   * Accepts strings for remote src URLs / inline base64 images or ReactNode for local icons
   */
  walletIcon: ReactNode | string;
  walletName: string;
  isLoading: boolean;
  isDisabled: boolean;

  onClick(): void;
}

export const WALLET_BUTTON_ICON_SIZE_CLASSNAME = 'size-5';

export function WalletButton({
  dataTestId,
  className,
  walletIcon,
  walletName,
  isLoading,
  isDisabled,
  onClick,
}: Props) {
  const { t } = useTranslation();
  // If icon is a string, then it is a remote src URL
  const startIcon =
    typeof walletIcon === 'string' ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={walletIcon}
        className={WALLET_BUTTON_ICON_SIZE_CLASSNAME}
        alt={walletName}
      />
    ) : (
      walletIcon
    );

  return (
    <SecondaryButton
      className={joinClassNames(
        'flex items-center justify-start px-2',
        'text-text-primary',
        // setting button height to avoid jank due to difference
        // in size between wallet icon and spinner
        'h-11',
        className,
      )}
      onClick={onClick}
      isLoading={isLoading}
      disabled={isDisabled}
      startIcon={startIcon}
      dataTestId={dataTestId}
    >
      {isLoading ? t(($) => $.buttons.waitingForWallet) : walletName}
    </SecondaryButton>
  );
}
