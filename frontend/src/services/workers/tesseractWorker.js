// Web Worker for OCR
import Tesseract from 'tesseract.js';

self.onmessage = async (e) => {
  const { imageData, options } = e.data;
  
  try {
    const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
      logger: (m) => {
        self.postMessage({ type: 'progress', data: m });
      },
    });
    
    self.postMessage({ type: 'success', data: { text } });
  } catch (error) {
    self.postMessage({ type: 'error', data: error.message });
  }
};

