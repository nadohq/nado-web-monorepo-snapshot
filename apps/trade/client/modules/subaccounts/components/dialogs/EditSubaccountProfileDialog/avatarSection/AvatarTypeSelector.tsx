import {
  EnsAvatarData,
  ProfileAvatar,
  ProfileAvatarType,
  SubaccountProfile,
  useEVMContext,
} from '@nadohq/react-client';
import { LabelTooltip } from '@nadohq/web-ui';
import { IdentityIcon } from 'client/components/Icons/IdentityIcon';
import {
  AvatarTypeButton,
  AvatarTypeButtonProps,
} from 'client/modules/subaccounts/components/dialogs/EditSubaccountProfileDialog/avatarSection/AvatarTypeButton';
import { EnsAvatarImage } from 'client/modules/subaccounts/components/EnsAvatarImage';
import { getSubaccountIdentityIconId } from 'client/modules/subaccounts/utils/getSubaccountIdentityIconId';
import { ReactNode, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  form: UseFormReturn<SubaccountProfile>;
  watchedAvatar: ProfileAvatar;
  subaccountName: string;
  ensAvatar: EnsAvatarData;
}

interface AvatarTypeButtonConfig {
  title: string;
  type: ProfileAvatarType;
  icon: ReactNode;
  disabled?: boolean;
  tooltipLabel?: string;
}

const ICON_SIZE = 24;

const AVATAR_TYPE_TO_VALUE: Record<ProfileAvatarType, ProfileAvatar> = {
  default: { type: 'default' },
  ens: { type: 'ens' },
};

export function AvatarTypeSelector({
  form,
  watchedAvatar,
  ensAvatar,
  subaccountName,
}: Props) {
  const { t } = useTranslation();
  const {
    connectionStatus: { address },
  } = useEVMContext();

  const hasEnsData = !!ensAvatar;

  const avatarTypes: AvatarTypeButtonConfig[] = useMemo(
    () => [
      {
        type: 'default',
        title: t(($) => $.default),
        icon: (
          <IdentityIcon
            size={ICON_SIZE}
            identifier={getSubaccountIdentityIconId(address, subaccountName)}
          />
        ),
      },
      {
        type: 'ens',
        title: t(($) => $.ensAvatar),
        icon: (
          <EnsAvatarImage
            width={ICON_SIZE}
            height={ICON_SIZE}
            ensAvatar={ensAvatar}
          />
        ),
        disabled: !hasEnsData,
        tooltipLabel: hasEnsData
          ? undefined
          : t(($) => $.errors.noEnsConnected),
      },
    ],
    [address, subaccountName, ensAvatar, hasEnsData, t],
  );

  return (
    <div className="flex flex-col gap-y-3">
      <p className="text-text-tertiary text-xs">{t(($) => $.avatar)}</p>
      <div className="text-text-primary grid grid-cols-2 gap-x-3">
        {avatarTypes.map(({ type, icon, title, disabled, tooltipLabel }) => {
          const avatarValue = AVATAR_TYPE_TO_VALUE[type];

          const commonCardProps: AvatarTypeButtonProps = {
            // Fill width of LabelTooltip
            className: tooltipLabel && 'w-full',
            icon,
            label: title,
            disabled,
            isSelected: type === watchedAvatar.type,
            onClick: () => {
              form.setValue('avatar', avatarValue);
            },
          };

          if (tooltipLabel) {
            return (
              <LabelTooltip
                key={type}
                label={tooltipLabel}
                asChild
                noHelpCursor
              >
                <AvatarTypeButton {...commonCardProps} />
              </LabelTooltip>
            );
          }

          return <AvatarTypeButton key={type} {...commonCardProps} />;
        })}
      </div>
    </div>
  );
}
