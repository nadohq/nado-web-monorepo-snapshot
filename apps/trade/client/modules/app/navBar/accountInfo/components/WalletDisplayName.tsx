import { WithClassnames, mergeClassNames } from '@nadohq/web-common';
import { useConnectedAddressDisplayName } from 'client/hooks/util/useConnectedAddressDisplayName';
import { PrivateContent } from 'client/modules/privacy/components/PrivateContent';
import { usePrivacyMode } from 'client/modules/privacy/hooks/usePrivacyMode';

export function WalletDisplayName({ className }: WithClassnames) {
  const { isPrivacyModeEnabled } = usePrivacyMode();
  const { truncatedDisplayName } = useConnectedAddressDisplayName();

  return (
    <PrivateContent
      isPrivate={isPrivacyModeEnabled}
      className={mergeClassNames('text-xs font-medium', className)}
      dataTestId="navbar-wallet-display-name"
    >
      {truncatedDisplayName}
    </PrivateContent>
  );
}
