/**
 * High-Precision Signature Image Transparency & Extraction Engine
 * 
 * Automatically eliminates black, dark, white, or cloudy background boxes
 * from scanned or photographed signatures, delivering a pristine, 100% transparent
 * alpha PNG suitable for luxury certificates, PDF exports, and contracts.
 */

export interface SignatureProcessOptions {
  /** Target stroke appearance: 'gold' (default for luxury certs), 'white', 'black', or 'original' */
  mode?: 'gold' | 'white' | 'black' | 'original';
  /** Background removal sensitivity: 0 to 1 (default: 0.35) */
  threshold?: number;
  /** Automatically crop empty transparent borders around signature strokes */
  autoCrop?: boolean;
  /** Contrast enhancement multiplier (default: 1.4) */
  contrast?: number;
}

/**
 * Loads an image from a URL, Data URL, File, or Blob
 */
export function loadImageElement(source: string | File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    if (typeof source === 'string') {
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error('Failed to load signature image: ' + e));
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to decode signature file'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read signature file'));
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Processes any signature image and strips all background colors (black, white, or dark boxes),
 * yielding a clean, transparent PNG.
 */
export async function makeSignatureTransparent(
  source: string | File | Blob,
  options: SignatureProcessOptions = {}
): Promise<string> {
  try {
    const {
      mode = 'gold',
      threshold = 0.30,
      autoCrop = true,
      contrast = 1.3
    } = options;

    const img = await loadImageElement(source);

    // Normalize dimensions (max 1000px width/height for fast canvas operations & crisp vector-like fidelity)
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;
    const MAX_SIZE = 1000;

    if (width > MAX_SIZE || height > MAX_SIZE) {
      if (width > height) {
        height = Math.round((height * MAX_SIZE) / width);
        width = MAX_SIZE;
      } else {
        width = Math.round((width * MAX_SIZE) / height);
        height = MAX_SIZE;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      return typeof source === 'string' ? source : '';
    }

    ctx.drawImage(img, 0, 0, width, height);
    let imgData: ImageData;
    try {
      imgData = ctx.getImageData(0, 0, width, height);
    } catch (corsErr) {
      // CORS taint fallback
      console.warn('Canvas tainted by CORS, returning source directly:', corsErr);
      return typeof source === 'string' ? source : '';
    }

    const data = imgData.data;
  const totalPixels = width * height;

  // 1. Detect background type (Dark/Black background vs Light/White background vs Already Transparent)
  let sampleCount = 0;
  let cornerLuminanceSum = 0;
  let hasExistingAlpha = false;

  // Sample perimeter pixels (corners & edges) to determine background tone
  const samplePoints: [number, number][] = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    [Math.floor(width / 2), 0], [Math.floor(width / 2), height - 1],
    [0, Math.floor(height / 2)], [width - 1, Math.floor(height / 2)],
    [2, 2], [width - 3, 2], [2, height - 3], [width - 3, height - 3]
  ];

  for (const [x, y] of samplePoints) {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3];
      if (a < 100) {
        hasExistingAlpha = true;
      }
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      cornerLuminanceSum += lum;
      sampleCount++;
    }
  }

  const avgCornerLum = sampleCount > 0 ? cornerLuminanceSum / sampleCount : 0.5;
  const isDarkBackground = avgCornerLum < 0.45; // Image has a black or dark background

  // Bounding box tracker for auto-cropping
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let hasForegroundPixels = false;

  // Gold tint colors: [R, G, B]
  const GOLD_RGB = [234, 179, 8]; // Tailwind Gold 500 (#EAB308)
  const WHITE_RGB = [255, 255, 255];
  const BLACK_RGB = [15, 15, 18];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    const pixelIndex = i / 4;
    const px = pixelIndex % width;
    const py = Math.floor(pixelIndex / width);

    // Compute relative luminance (0 to 1)
    let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    let targetAlpha = 0;

    if (isDarkBackground) {
      // Dark / Black Background (e.g. black photo or inverted scan):
      // The background is dark (lum close to 0). Strokes are brighter (lum > threshold).
      const cutoff = Math.max(0.12, threshold * 0.7);
      if (lum <= cutoff) {
        targetAlpha = 0;
      } else {
        // Smooth alpha ramp for anti-aliasing
        const norm = Math.min(1, Math.max(0, (lum - cutoff) / (1 - cutoff)));
        targetAlpha = Math.round(Math.pow(norm, 0.75) * 255 * (a / 255));
      }
    } else {
      // Light / White Background (e.g. paper scan):
      // The background is light (lum close to 1). Strokes are dark (lum < 1 - threshold).
      const cutoff = Math.min(0.88, 1 - (threshold * 0.6));
      if (lum >= cutoff) {
        targetAlpha = 0;
      } else {
        const darkness = Math.min(1, Math.max(0, (cutoff - lum) / cutoff));
        targetAlpha = Math.round(Math.pow(darkness, 0.75) * 255 * (a / 255));
      }
    }

    // Apply contrast boost if pixel is visible
    if (targetAlpha > 12) {
      targetAlpha = Math.min(255, Math.round(targetAlpha * contrast));
      
      // Update stroke bounding box
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
      hasForegroundPixels = true;

      // Color mapping
      if (mode === 'gold') {
        data[i] = GOLD_RGB[0];
        data[i + 1] = GOLD_RGB[1];
        data[i + 2] = GOLD_RGB[2];
      } else if (mode === 'white') {
        data[i] = WHITE_RGB[0];
        data[i + 1] = WHITE_RGB[1];
        data[i + 2] = WHITE_RGB[2];
      } else if (mode === 'black') {
        data[i] = BLACK_RGB[0];
        data[i + 1] = BLACK_RGB[1];
        data[i + 2] = BLACK_RGB[2];
      }
      // If 'original', keep r, g, b untouched
    } else {
      targetAlpha = 0;
    }

    data[i + 3] = targetAlpha;
  }

  // Put modified pixel data back
  ctx.putImageData(imgData, 0, 0);

  // If no strokes were detected (e.g., completely blank or uniform image), return original canvas
  if (!hasForegroundPixels || !autoCrop) {
    return canvas.toDataURL('image/png');
  }

  // Auto-crop to stroke bounding box with padding
  const PADDING = 12;
  const cropX = Math.max(0, minX - PADDING);
  const cropY = Math.max(0, minY - PADDING);
  const cropWidth = Math.min(width - cropX, (maxX - minX) + PADDING * 2);
  const cropHeight = Math.min(height - cropY, (maxY - minY) + PADDING * 2);

  if (cropWidth <= 0 || cropHeight <= 0) {
    return canvas.toDataURL('image/png');
  }

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    return canvas.toDataURL('image/png');
  }

  croppedCtx.drawImage(
    canvas,
    cropX, cropY, cropWidth, cropHeight,
    0, 0, cropWidth, cropHeight
  );

  return croppedCanvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Error in makeSignatureTransparent, fallback to source:', err);
    return typeof source === 'string' ? source : '';
  }
}
