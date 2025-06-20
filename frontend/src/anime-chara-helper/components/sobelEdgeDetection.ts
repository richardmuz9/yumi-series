export async function sobelEdgeDetection(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;
      // Grayscale
      const gray = new Uint8ClampedArray(width * height);
      for (let i = 0; i < width * height; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      }
      // Sobel kernels
      const gx = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1],
      ];
      const gy = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1],
      ];
      const out = new Uint8ClampedArray(width * height);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let sumX = 0;
          let sumY = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const px = x + kx;
              const py = y + ky;
              const val = gray[py * width + px];
              sumX += gx[ky + 1][kx + 1] * val;
              sumY += gy[ky + 1][kx + 1] * val;
            }
          }
          const mag = Math.sqrt(sumX * sumX + sumY * sumY);
          out[y * width + x] = mag > 100 ? 255 : 0; // Threshold for binarization
        }
      }
      // Write back to imageData
      for (let i = 0; i < width * height; i++) {
        const v = out[i];
        data[i * 4] = v;
        data[i * 4 + 1] = v;
        data[i * 4 + 2] = v;
        data[i * 4 + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
} 