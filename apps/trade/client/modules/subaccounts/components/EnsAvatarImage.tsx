// disabling <img> warning to allow for external images from ENS
/* eslint-disable @next/next/no-img-element */
import { EnsAvatarData } from '@nadohq/react-client';
import { useTranslation } from 'react-i18next';

interface Props {
  ensAvatar: EnsAvatarData;
  width: number;
  height: number;
}

export function EnsAvatarImage({ ensAvatar, width, height }: Props) {
  const { t } = useTranslation();

  return (
    <div style={{ width, height }}>
      {!!ensAvatar && (
        <img
          src={ensAvatar}
          alt={t(($) => $.imageAltText.ensIcon)}
          className="h-full w-full rounded-full"
        />
      )}
    </div>
  );
}
