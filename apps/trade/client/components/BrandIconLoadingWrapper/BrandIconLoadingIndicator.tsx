import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { IMAGES } from 'common/brandMetadata/images';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  /** The size of the icon */
  size: number;
  /** If true, removes saturation and lowers opacity */
  grayscale?: boolean;
}

export function BrandIconLoadingIndicator({
  size,
  grayscale,
  className,
}: Props) {
  const { t } = useTranslation();
  return (
    <Image
      src={IMAGES.brandIcon}
      alt={t(($) => $.imageAltText.loadingIndicator)}
      width={size}
      priority
      className={joinClassNames(
        'h-auto animate-ping',
        grayscale && 'opacity-20 saturate-0',
        className,
      )}
    />
  );
}
