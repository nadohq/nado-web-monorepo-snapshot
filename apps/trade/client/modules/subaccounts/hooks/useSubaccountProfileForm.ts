import {
  EnsAvatarData,
  ProfileAvatar,
  ProfileErrorType,
  SubaccountProfile,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useEnsProfile } from 'client/modules/subaccounts/hooks/useEnsProfile';
import { getDefaultSubaccountUsername } from 'client/modules/subaccounts/utils/getDefaultSubaccountUsername';
import { watchFormError } from 'client/utils/form/watchFormError';
import { isEqual } from 'lodash';
import { useCallback } from 'react';
import { useForm, UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export interface UseSubaccountProfileForm {
  form: UseFormReturn<SubaccountProfile>;
  // Data
  /**
   * The subaccount name the profile is being saved for. Depending on whether
   * we are editing or adding an account, this could either be the current
   * subaccount's name, or the new subaccount's name, respectively.
   */
  profileSubaccountName: string;
  currentSubaccountAddress: string | undefined;
  ensAvatar: EnsAvatarData;
  // Form state
  watchedUsername: string;
  watchedAvatar: ProfileAvatar;
  isFormDirty: boolean;
  formError: ProfileErrorType | undefined;
  validateUsername: (username: string) => ProfileErrorType | undefined;
  handleSubmit: () => void;
  resetChanges: () => void;
}

const usernameSchema = z
  .string()
  .min(0)
  .max(24)
  .regex(/^[\w ]*?$/);

interface Params {
  subaccountName?: string;
  onSubmit?: () => void;
  isNewSubaccount?: boolean;
}

export function useSubaccountProfileForm({
  subaccountName,
  onSubmit,
  isNewSubaccount,
}: Params): UseSubaccountProfileForm {
  const { t } = useTranslation();
  const { currentSubaccount, getSubaccountProfile, saveSubaccountProfile } =
    useSubaccountContext();
  const { ensAvatar } = useEnsProfile();

  const profileSubaccountName = subaccountName ?? currentSubaccount.name;
  const { username, avatar } = getSubaccountProfile(profileSubaccountName);

  // Form state
  const useProfileForm = useForm<SubaccountProfile>({
    mode: 'onChange',
    // If we're adding a new subaccount, start the username input off blank.
    // If the user leaves the input blank, we will assign them a default.
    defaultValues: { username: isNewSubaccount ? '' : username, avatar },
  });

  const [watchedUsername, watchedAvatar] = useWatch({
    control: useProfileForm.control,
    name: ['username', 'avatar'],
  });

  const usernameError: ProfileErrorType | undefined = watchFormError(
    useProfileForm,
    'username',
  );

  const formError = usernameError;

  const onSubmitForm = (values: SubaccountProfile) => {
    const valuesWithDefaultUsername = {
      ...values,
      // Assign a default username if the input was left blank.
      username: values.username
        ? values.username
        : getDefaultSubaccountUsername(profileSubaccountName, t),
    };

    // If the username was left blank, upon form submit the username input won't
    // show the default username and `isFormDirty` won't return `false` unless we
    // manually set it to the default.
    useProfileForm.setValue('username', valuesWithDefaultUsername.username);

    saveSubaccountProfile(profileSubaccountName, valuesWithDefaultUsername);
    onSubmit?.();
  };

  // Username validation
  const validateUsername = useCallback((username: string) => {
    if (!usernameSchema.safeParse(username).success) {
      return 'username_error';
    }
  }, []);

  const resetChanges = () => {
    useProfileForm.setValue('username', username);
    useProfileForm.setValue('avatar', avatar);
  };

  const didUsernameChange = !isEqual(watchedUsername, username);
  const didAvatarChange = !isEqual(watchedAvatar, avatar);
  const isFormDirty = didUsernameChange || didAvatarChange;

  return {
    form: useProfileForm,
    watchedUsername,
    watchedAvatar,
    handleSubmit: useProfileForm.handleSubmit(onSubmitForm),
    formError,
    validateUsername,
    profileSubaccountName,
    currentSubaccountAddress: currentSubaccount.address,
    resetChanges,
    isFormDirty,
    ensAvatar,
  };
}
