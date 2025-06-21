import sharp from 'sharp';
// Using dynamic import for node-fetch
import type { Response } from 'node-fetch';

interface PostProcessingOptions {
  upscale: boolean;
  denoise: boolean;
  lineArtCleanup: boolean;
  colorCorrection: {
    contrast: number;
    saturation: number;
    bloom: number;
  };
}

export async function processImage(imageUrl: string, options: PostProcessingOptions): Promise<string> {
  // Dynamically import node-fetch
  const fetch = (await import('node-fetch')).default;
  
  // Download the image
  const response: Response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();

  let image = sharp(Buffer.from(buffer));

  // Apply post-processing steps
  if (options.upscale) {
    image = image.resize(2048, 2048, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  if (options.denoise) {
    image = image.median(3); // Light noise reduction
  }

  if (options.colorCorrection) {
    const { contrast, saturation, bloom } = options.colorCorrection;
    
    // Apply saturation
    image = image.modulate({
      brightness: 1.0,
      saturation: 1 + (saturation / 100),
    });
    
    // Apply contrast using linear adjustment
    if (contrast !== 0) {
      image = image.linear(
        1 + (contrast / 100), // Slope (multiplier)
        -(contrast * 128) / 100 // Offset (intercept)
      );
    }
    
    // Apply bloom effect if requested
    if (bloom > 0) {
      image = image.convolve({
        width: 3,
        height: 3,
        kernel: [
          1, 1, 1,
          1, 1 + (bloom / 25), 1,
          1, 1, 1
        ]
      });
    }
  }

  if (options.lineArtCleanup) {
    // Enhance edges and clean up line art
    image = image
      .sharpen(1)
      .threshold(128)
      .normalize();
  }

  // Save to a temporary file and return its URL
  const outputFilename = `processed_${Date.now()}.png`;
  const outputPath = `/uploads/${outputFilename}`;
  await image.toFile(`./uploads/${outputFilename}`);

  return outputPath;
} 