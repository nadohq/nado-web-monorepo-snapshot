import { WithClassnames, mergeClassNames } from '@nadohq/web-common';
import { useConnectedAddressDisplayName } from 'client/hooks/util/useConnectedAddressDisplayName';
import { PrivateContent } from 'client/modules/privacy/components/PrivateContent';
import { usePrivacySetting } from 'client/modules/privacy/hooks/usePrivacySetting';

export function WalletDisplayName({ className }: WithClassnames) {
  const [isAddressPrivate] = usePrivacySetting('isAddressPrivate');
  const { truncatedDisplayName } = useConnectedAddressDisplayName();

  return (
    <PrivateContent
      isPrivate={isAddressPrivate}
      className={mergeClassNames('text-xs font-medium', className)}
      dataTestId="navbar-wallet-display-name"
    >
      {truncatedDisplayName}
    </PrivateContent>
  );
}
