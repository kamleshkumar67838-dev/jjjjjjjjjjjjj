/**
 * AI & Smart Auto-Fitter for Virtual Cards
 * Automatically transforms ANY uploaded photo (vertical, square, wide, mobile camera)
 * into a perfectly proportioned, high-definition Credit Card Skin (1.586:1 ISO ratio).
 */

export interface CardFitOptions {
  targetWidth?: number;
  targetHeight?: number;
  quality?: number;
}

export const aiSmartFitCardPhoto = (
  file: File | string,
  options: CardFitOptions = {}
): Promise<string> => {
  const targetWidth = options.targetWidth || 856;
  const targetHeight = options.targetHeight || 540; // Exact 1.585 credit card ratio
  const quality = options.quality || 0.92;

  return new Promise((resolve, reject) => {
    const loadImage = (src: string) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(src);
            return;
          }

          const imgW = img.naturalWidth || img.width;
          const imgH = img.naturalHeight || img.height;
          const imgRatio = imgW / imgH;
          const cardRatio = targetWidth / targetHeight; // ~1.586

          // Clean dark background
          ctx.fillStyle = '#080c1e';
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          // CASE 1: Standard Landscape or Wide image (ratio >= 1.2)
          if (imgRatio >= 1.2) {
            // Cover crop with smart focal centering
            let drawW = targetWidth;
            let drawH = targetWidth / imgRatio;

            if (drawH < targetHeight) {
              drawH = targetHeight;
              drawW = targetHeight * imgRatio;
            }

            const offsetX = (targetWidth - drawW) / 2;
            const offsetY = (targetHeight - drawH) / 2;

            ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
          } 
          // CASE 2: Square or Portrait image (ratio < 1.2)
          // Uses Apple Card style ambient background extension so zero content gets distorted or awkwardly clipped!
          else {
            // Layer 1: Ambient blurred background to fill the card boundaries beautifully
            ctx.save();
            ctx.filter = 'blur(24px) brightness(0.65) saturate(1.4)';
            const bgScale = Math.max(targetWidth / imgW, targetHeight / imgH) * 1.2;
            const bgW = imgW * bgScale;
            const bgH = imgH * bgScale;
            ctx.drawImage(
              img,
              (targetWidth - bgW) / 2,
              (targetHeight - bgH) / 2,
              bgW,
              bgH
            );
            ctx.restore();

            // Layer 2: Subtle card vignette overlay
            const gradient = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
            gradient.addColorStop(0, 'rgba(0,0,0,0.25)');
            gradient.addColorStop(0.5, 'rgba(0,0,0,0.05)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            // Layer 3: Crisp centered primary artwork with subtle rounded drop shadow
            const mainScale = Math.min((targetHeight * 0.94) / imgH, (targetWidth * 0.85) / imgW);
            const mainW = imgW * mainScale;
            const mainH = imgH * mainScale;
            const mainX = (targetWidth - mainW) / 2;
            const mainY = (targetHeight - mainH) / 2;

            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
            ctx.shadowBlur = 28;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 8;
            ctx.drawImage(img, mainX, mainY, mainW, mainH);
            ctx.restore();
          }

          // Subtle glossy sheen overlay along the top edge for realistic card lighting
          const sheen = ctx.createLinearGradient(0, 0, targetWidth, targetHeight * 0.4);
          sheen.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
          sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = sheen;
          ctx.fillRect(0, 0, targetWidth, targetHeight * 0.4);

          // Export high-resolution compressed JPEG
          const resultDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(resultDataUrl);
        } catch (err) {
          console.error('AI smart fit failed, using original source', err);
          resolve(src);
        }
      };

      img.onerror = () => {
        resolve(src);
      };

      img.src = src;
    };

    if (typeof file === 'string') {
      loadImage(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        loadImage(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    }
  });
};
