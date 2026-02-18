const MAX_IMAGE_SIZE = 500 * 1024; // 500KB limit for LocalStorage
const MAX_DIMENSION = 800; // Max width/height for resized images

/**
 * Optimized image processing utility that resizes and compresses images
 * before converting to base64 to prevent UI lag and reduce storage size.
 */
export async function convertImageToBase64(file: File): Promise<string> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size before processing
  if (file.size > MAX_IMAGE_SIZE * 4) {
    throw new Error('Image size must be less than 2MB');
  }

  try {
    // Load image
    const img = await loadImage(file);
    
    // Calculate new dimensions maintaining aspect ratio
    let { width, height } = img;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }
    }

    // Create canvas and resize image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(img, 0, 0, width, height);

    // Convert to base64 with compression
    let quality = 0.8;
    let base64 = canvas.toDataURL('image/jpeg', quality);

    // Reduce quality if still too large
    while (base64.length > MAX_IMAGE_SIZE * 1.37 && quality > 0.1) {
      quality -= 0.1;
      base64 = canvas.toDataURL('image/jpeg', quality);
    }

    if (base64.length > MAX_IMAGE_SIZE * 1.37) {
      throw new Error('Image size must be less than 500KB after compression');
    }

    return base64;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to process image');
  }
}

/**
 * Load image from file using createImageBitmap for better performance
 */
async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}
