export type ProfileAvatar =
  | {
      type: 'ens';
    }
  | {
      type: 'default';
    };

export type ProfileAvatarType = ProfileAvatar['type'];

export type ProfileErrorType = 'username_error';

export type EnsAvatarData = string | null | undefined;

export interface SubaccountProfile {
  avatar: ProfileAvatar;
  username: string;
}
