import { ProfileAvatar } from '@nadohq/react-client';

export function isValidProfileAvatar(
  maybeAvatar: Partial<ProfileAvatar> | undefined,
): maybeAvatar is ProfileAvatar {
  if (!maybeAvatar || !maybeAvatar.type) {
    return false;
  }

  return maybeAvatar.type === 'default' || maybeAvatar.type === 'ens';
}
