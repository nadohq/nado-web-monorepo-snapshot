/**
 * Inline type for asset module declarations so this file stays ambient.
 * Exported canonical type lives in types/ImageSrc.ts.
 */
interface StaticImageDataLike {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
}

type AssetModuleExport =
  | string
  | StaticImageDataLike
  | {
      default: StaticImageDataLike;
    };

declare module '*.svg' {
  const content: AssetModuleExport;
  export default content;
}

declare module '*.png' {
  const content: AssetModuleExport;
  export default content;
}

declare module '*.webp' {
  const content: AssetModuleExport;
  export default content;
}
