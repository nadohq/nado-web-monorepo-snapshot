import { ProfileAvatar, useSubaccountContext } from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { IdentityIcon } from 'client/components/Icons/IdentityIcon';
import { EnsAvatarImage } from 'client/modules/subaccounts/components/EnsAvatarImage';
import { useEnsProfile } from 'client/modules/subaccounts/hooks/useEnsProfile';
import { getSubaccountIdentityIconId } from 'client/modules/subaccounts/utils/getSubaccountIdentityIconId';

interface Props extends WithClassnames {
  avatar: ProfileAvatar;
  size: number;
  /**
   * Used in combination with the currently connected `address` to create a
   * unique identity icon pattern. If not provided, the current subaccount's
   * name is used.
   */
  subaccountName?: string;
}

export function ProfileAvatarIcon({
  avatar,
  size,
  className,
  subaccountName,
}: Props) {
  const {
    currentSubaccount: { address, name: currentSubaccountName },
  } = useSubaccountContext();

  const identityIconId = getSubaccountIdentityIconId(
    address,
    subaccountName ?? currentSubaccountName,
  );

  const { ensAvatar } = useEnsProfile();

  const profileAvatar = (() => {
    if (avatar.type === 'ens' && !!ensAvatar) {
      return (
        <EnsAvatarImage width={size} height={size} ensAvatar={ensAvatar} />
      );
    } else {
      return <IdentityIcon size={size} identifier={identityIconId} />;
    }
  })();

  return <div className={className}>{profileAvatar}</div>;
}
