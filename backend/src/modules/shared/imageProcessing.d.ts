export interface PostProcessingOptions {
  upscale: boolean;
  denoise: boolean;
  lineArtCleanup: boolean;
  colorCorrection: {
    contrast: number;
    saturation: number;
    bloom: number;
  };
}

export function processImage(imageUrl: string, options: PostProcessingOptions): Promise<string>; 