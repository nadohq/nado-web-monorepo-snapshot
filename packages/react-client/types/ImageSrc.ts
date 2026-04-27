/**
 * Framework-agnostic image source type.
 * Accepts URL strings and the shape produced by bundlers (e.g. Next.js) when
 * importing image/SVG files. Compatible with next/image when used in a Next.js app.
 */
export interface StaticImageDataLike {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
}

type WebImageSrc =
  | string
  | StaticImageDataLike
  | { default: StaticImageDataLike };

declare global {
  /**
   * Platform-specific override point for ImageSrc.
   * If this interface is augmented, ImageSrc resolves to the override union.
   * If not augmented, ImageSrc falls back to WebImageSrc.
   */
  interface NadoReactClientImageSrcOverrideMap {}

  /**
   * Platform-specific override point for MetadataContextImageSrc.
   * If this interface is augmented, MetadataContextImageSrc resolves to the override union.
   * If not augmented, MetadataContextImageSrc falls back to ImageSrc.
   *
   * Use this when token icons are sourced differently from other images on the
   * same platform. For example, on mobile: locally-bundled chain icons are
   * `FC<SvgProps>` (ImageSrc), while token icons from /api/product-metadata
   * are URL strings (MetadataContextImageSrc).
   *
   * Example override in globals.d.ts:
   *   interface NadoReactClientTokenImageSrcOverrideMap { token: string; }
   */
  interface NadoReactClientTokenImageSrcOverrideMap {}
}

export type ImageSrc = keyof NadoReactClientImageSrcOverrideMap extends never
  ? WebImageSrc
  : NadoReactClientImageSrcOverrideMap[keyof NadoReactClientImageSrcOverrideMap];

export type MetadataContextImageSrc =
  keyof NadoReactClientTokenImageSrcOverrideMap extends never
    ? ImageSrc
    : NadoReactClientTokenImageSrcOverrideMap[keyof NadoReactClientTokenImageSrcOverrideMap];
