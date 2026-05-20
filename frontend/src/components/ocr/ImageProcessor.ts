/**
 * Image preprocessing utilities for OCR optimization
 * Based on best practices from Tesseract.js documentation
 */

export class ImageProcessor {
  static readonly TOTAL_KEYWORDS = [
    'grand total',
    'amount due',
    'amount payable',
    'total amount',
    'net amount',
    'bill amount',
    'balance due',
    'total',
  ];

  /**
   * Preprocess image for better OCR accuracy
   * - Convert to grayscale
   * - Apply contrast enhancement
   * - Denoise if needed
   */
  static async preprocessImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Set canvas size to match image
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Convert to grayscale and enhance contrast
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            
            // Apply threshold for better text detection
            const threshold = 128;
            const bw = gray > threshold ? 255 : 0;
            
            data[i] = bw;     // R
            data[i + 1] = bw; // G
            data[i + 2] = bw; // B
          }

          // Put processed data back
          ctx.putImageData(imageData, 0, 0);

          // Convert to base64
          resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resize image if too large (for faster processing)
   */
  static async resizeImage(file: File, maxWidth = 1920, maxHeight = 1080): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          let { width, height } = img;
          
          // Calculate new dimensions
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/png' }));
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png');
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Calculate image hash for deduplication
   */
  static async calculateHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static detectBillTotal(text: string): {
    amount: number | null;
    confidence: number;
    strategy: 'keyword' | 'keyword_next_line' | 'largest_number_fallback' | 'not_found';
  } {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    let largestAmount = 0;
    let keywordCandidate: number | null = null;
    let nextLineCandidate: number | null = null;

    lines.forEach((line, index) => {
      const normalizedLine = line.toLowerCase();
      const amounts = ImageProcessor.extractAmounts(line);
      if (amounts.length > 0) {
        largestAmount = Math.max(largestAmount, ...amounts);
      }

      if (ImageProcessor.hasTotalKeyword(normalizedLine)) {
        if (amounts.length > 0 && keywordCandidate === null) {
          keywordCandidate = Math.max(...amounts);
        }

        if (nextLineCandidate === null && index + 1 < lines.length) {
          const nextAmounts = ImageProcessor.extractAmounts(lines[index + 1]);
          if (nextAmounts.length > 0) {
            nextLineCandidate = Math.max(...nextAmounts);
          }
        }
      }
    });

    if (keywordCandidate !== null) {
      return { amount: keywordCandidate, confidence: 94, strategy: 'keyword' };
    }

    if (nextLineCandidate !== null) {
      return { amount: nextLineCandidate, confidence: 84, strategy: 'keyword_next_line' };
    }

    if (largestAmount > 0) {
      return { amount: largestAmount, confidence: 62, strategy: 'largest_number_fallback' };
    }

    return { amount: null, confidence: 0, strategy: 'not_found' };
  }

  private static extractAmounts(line: string): number[] {
    const matches = line.matchAll(/(?:rs\.?|inr|₹)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/gi);
    return Array.from(matches)
      .map(match => Number.parseFloat(match[1].replace(/,/g, '')))
      .filter(amount => Number.isFinite(amount) && amount > 0)
      .map(amount => Math.round(amount * 100) / 100);
  }

  private static hasTotalKeyword(normalizedLine: string): boolean {
    if (
      (normalizedLine.includes('subtotal') || normalizedLine.includes('sub total')) &&
      !ImageProcessor.TOTAL_KEYWORDS.some(keyword => keyword !== 'total' && normalizedLine.includes(keyword))
    ) {
      return false;
    }

    return ImageProcessor.TOTAL_KEYWORDS.some(keyword => normalizedLine.includes(keyword));
  }
}
