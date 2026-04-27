import { WithChildren } from '@nadohq/web-common';
import Image from 'next/image';
import { RefObject } from 'react';

interface Props {
  generateImgContainerRef: RefObject<HTMLDivElement | null>;
  previewImage: { url: string } | undefined;
  previewImageAlt: string;
}

/**
 * Container for social sharing preview image.
 * Wraps the content to be captured as an image and overlays the generated preview.
 */
export function SocialSharingPreviewImage({
  children,
  generateImgContainerRef,
  previewImage,
  previewImageAlt,
}: WithChildren<Props>) {
  return (
    <div className="relative aspect-video">
      <div className="h-full w-full" ref={generateImgContainerRef}>
        {children}
      </div>
      {/* Render preview image so it can be copied directly from browser.
          Overlay it to prevent flicker */}
      {previewImage && (
        <Image fill src={previewImage.url} alt={previewImageAlt} />
      )}
    </div>
  );
}
