'use client';
import {
  mergeClassNames,
  NextImageSrc,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { IconButton, Icons, SizeClass, useSizeClass } from '@nadohq/web-ui';

import nadoDesktopBannerBg from 'client/modules/app/components/banners/AppBanner/assets/nado-desktop-banner-bg.png';
import nadoMobileBannerBg from 'client/modules/app/components/banners/AppBanner/assets/nado-mobile-banner-bg.png';

import Image from 'next/image';

export interface AppBannerProps extends WithClassnames, WithChildren {
  /**
   * If not set, no close button is rendered
   */
  onDismiss?: () => void;
}

const BG_IMAGE_SRC_BY_SIZE_CLASS: Record<SizeClass, NextImageSrc> = {
  desktop: nadoDesktopBannerBg,
  tablet: nadoDesktopBannerBg,
  mobile: nadoMobileBannerBg,
};

export function AppBanner({ className, onDismiss, children }: AppBannerProps) {
  const sizeClass = useSizeClass();

  const bgImageSrc = BG_IMAGE_SRC_BY_SIZE_CLASS[sizeClass.value];

  return (
    <div
      className={mergeClassNames(
        'relative flex overflow-hidden px-4 py-4 sm:px-12 sm:py-5',
        'flex-col items-center justify-center gap-1 sm:flex-row',
        'text-xs',
        className,
      )}
    >
      {children}
      {bgImageSrc && (
        <Image
          className="absolute right-0 left-0 -z-10 h-full w-full"
          src={bgImageSrc}
          priority
          quality={100}
          alt=""
        />
      )}
      {onDismiss && (
        <IconButton
          icon={Icons.X}
          size="xs"
          onClick={onDismiss}
          className="absolute top-1/2 right-4 -translate-y-1/2"
        />
      )}
    </div>
  );
}
