import { ProfileAvatar } from '@nadohq/react-client';
import { ProfileAvatarIcon } from 'client/modules/subaccounts/components/ProfileAvatarIcon';
import { getDefaultSubaccountUsername } from 'client/modules/subaccounts/utils/getDefaultSubaccountUsername';
import { useTranslation } from 'react-i18next';

interface Props {
  watchedUsername: string;
  watchedAvatar: ProfileAvatar;
  subaccountName: string;
}

export function SubaccountProfilePreview({
  watchedUsername,
  watchedAvatar,
  subaccountName,
}: Props) {
  const { t } = useTranslation();
  // If the username's been cleared, we want to show the default username.
  const formUsername = watchedUsername.substring(0, 24);
  const defaultUsername = getDefaultSubaccountUsername(subaccountName, t);
  const username = formUsername ? formUsername : defaultUsername;

  return (
    <div className="flex items-center gap-x-2.5">
      <ProfileAvatarIcon
        avatar={watchedAvatar}
        size={40}
        subaccountName={subaccountName}
      />
      <p className="text-text-primary">{username}</p>
    </div>
  );
}
