import { asyncResult } from '@nadohq/client';
import { BRAND_METADATA } from 'common/brandMetadata/brandMetadata';
import { saveAs } from 'file-saver';
import { toBlob } from 'html-to-image';
import { useCallback, useEffect, useRef, useState } from 'react';

interface BuildBlobOptions {
  canvasHeight: number;
  canvasWidth: number;
  minDataSize: number;
}

// Calls toBlob until expected minDataSize is matched.
// This is know issue with html-to-image on Safari where image builds partially on first toBlob call.
// see: https://github.com/bubkoo/html-to-image/issues/361#issuecomment-1506037670
async function buildBlob(
  node: HTMLDivElement,
  { canvasHeight, canvasWidth, minDataSize }: BuildBlobOptions,
) {
  let blob = new Blob();

  const maxAttempts = 5;

  for (let i = 0; blob.size < minDataSize && i < maxAttempts; i++) {
    const imageBlob = await toBlob(node, {
      canvasHeight,
      canvasWidth,
    });

    if (imageBlob) {
      blob = imageBlob;
    }
  }

  return blob;
}

interface Params {
  /** Width of the generated canvas image */
  canvasWidth?: number;
  /** Height of the generated canvas image */
  canvasHeight?: number;
  /** Minimum data size threshold for the generated blob (used to work around Safari partial rendering issues) */
  minDataSize?: number;
  /** Text to be used in the X/Twitter post. */
  xPostText: string;
}

const DEFAULT_CANVAS_WIDTH = 1440;
const DEFAULT_CANVAS_HEIGHT = 1080;
const DEFAULT_MIN_DATA_SIZE = 3e6;

export function useSocialSharingImageGeneration({
  xPostText,
  canvasWidth = DEFAULT_CANVAS_WIDTH,
  canvasHeight = DEFAULT_CANVAS_HEIGHT,
  minDataSize = DEFAULT_MIN_DATA_SIZE,
}: Params) {
  const imageGenerationNodeRef = useRef<HTMLDivElement>(null);

  const [readyToGenerateImage, setReadyToGenerateImage] = useState(false);
  const [regenerateKey, setRegenerateKey] = useState(0);

  const [isCopied, setIsCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<
    | {
        blob: Blob;
        url: string;
      }
    | undefined
  >();

  const disableSocialSharingButtons = !previewImage;

  const generatePreviewImage = useCallback(async (): Promise<Blob> => {
    if (!imageGenerationNodeRef.current || !readyToGenerateImage) {
      throw new Error('[useSocialSharing] Not ready to generate image');
    }

    const blob = await buildBlob(imageGenerationNodeRef.current, {
      canvasHeight,
      canvasWidth,
      minDataSize,
    });

    if (!blob) {
      throw new Error('[useSocialSharing] Failed to generate image blob');
    }

    return blob;
  }, [readyToGenerateImage, canvasHeight, canvasWidth, minDataSize]);

  // Generate preview image after readyToGenerateImage
  useEffect(() => {
    if (!readyToGenerateImage) {
      return;
    }

    let isCancelled = false;

    generatePreviewImage()
      .then((blob) => {
        if (!isCancelled) {
          setPreviewImage({
            blob,
            url: URL.createObjectURL(blob),
          });
        }
      })
      .catch((err) => {
        console.error(`[useSocialSharing]: Failed to generate image`, err);
      });

    return () => {
      isCancelled = true;
    };
  }, [generatePreviewImage, readyToGenerateImage, regenerateKey]);

  const regenerateImage = useCallback(() => {
    // Update key to trigger regeneration of preview image.
    setRegenerateKey((key) => key + 1);
  }, []);

  const onReady = useCallback(() => {
    setReadyToGenerateImage(true);
  }, []);

  const copyImageToClipboard = useCallback(async () => {
    // Wrap in inner fn so we can use asyncResult.
    const writeToClipboard = async () => {
      if (!previewImage?.blob) {
        console.warn(
          `[useSocialSharing]: Failed to copy to clipboard. Image not generated`,
        );
        return;
      }

      // This prevents crashing on Firefox as ClipboardItem is not supported.
      if (typeof ClipboardItem === 'undefined') {
        console.warn(
          `[useSocialSharing]: Failed to copy to clipboard. ClipboardItem is not supported`,
        );
        return;
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          // This has to be passed as Promise. Otherwise permissions will fail on Safari.
          // See: https://web.dev/async-clipboard/
          'image/png': new Promise((resolve) => {
            resolve(previewImage?.blob);
          }),
        }),
      ]);

      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    };

    await asyncResult(writeToClipboard());
  }, [previewImage]);

  const downloadImage = useCallback(async () => {
    // Wrap in async function so we can use asyncResult.
    const download = async () => {
      if (!previewImage?.blob) {
        return;
      }

      saveAs(
        previewImage.blob,
        `${BRAND_METADATA.displayName}_${Date.now()}.png`,
      );
    };
    const [, error] = await asyncResult(download());

    if (error) {
      console.warn(`[useSocialSharing]: Failed to download image`, error);
    }
  }, [previewImage]);

  const copyAndOpenX = useCallback(() => {
    // wrap in asyncResult to ignore errors in case it fails.
    asyncResult(copyImageToClipboard());

    const baseIntentUrl = 'https://x.com/intent/post';
    const intentSearchParams = new URLSearchParams({
      text: xPostText,
    });

    // use setTimeout to bypass popup blocking on Safari and still allow copy to clipboard.
    setTimeout(
      () =>
        window.open(
          `${baseIntentUrl}?${intentSearchParams.toString()}`,
          '_blank',
        ),
      800,
    );
  }, [copyImageToClipboard, xPostText]);

  return {
    imageGenerationNodeRef,
    downloadImage,
    copyAndOpenX,
    copyImageToClipboard,
    previewImage,
    isCopied,
    disableSocialSharingButtons,
    regenerateImage,
    onReady,
  };
}
