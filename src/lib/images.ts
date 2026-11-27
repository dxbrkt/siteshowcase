import type { ImageMetadata } from 'astro';

const images = import.meta.glob<ImageMetadata>('../assets/images/**/*.jpg', {
  eager: true,
  import: 'default',
});

export function imageAsset(path: string): ImageMetadata {
  const image = images[`../assets/images/${path}`];
  if (!image) throw new Error(`Unknown image: ${path}`);
  return image;
}

export const fullWidthImageWidths = [480, 768, 1024, 1440, 1920];
export const halfWidthImageSizes =
  '(max-width: 920px) calc(100vw - 40px), (max-width: 1240px) 46vw, 560px';
export const gridImageSizes =
  '(max-width: 600px) calc(100vw - 40px), (max-width: 920px) 46vw, (max-width: 1240px) 30vw, 380px';
