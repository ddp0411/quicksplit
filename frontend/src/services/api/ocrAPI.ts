import { axiosClient } from './axiosClient';

export interface OCRUploadRequest {
  image: File;
  preprocessed?: boolean;
}

export interface OCRResult {
  text: string;
  confidence: number;
  detected_total: number | null;
  processing_time: number;
}

export interface OCRValidationRequest {
  text: string;
  detected_total: number | null;
  image_hash: string;
}

export const ocrAPI = {
  uploadAndProcess: async (data: OCRUploadRequest): Promise<OCRResult> => {
    const formData = new FormData();
    formData.append('file', data.image);
    if (data.preprocessed) {
      formData.append('preprocessed', 'true');
    }

    const response = await axiosClient.post<OCRResult>('/ocr/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  validateOCR: async (data: OCRValidationRequest) => {
    const response = await axiosClient.post('/ocr/validate', data);
    return response.data;
  },

  submitToDataset: async (imageFile: File, ocrText: string, actualTotal: number) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('ocr_text', ocrText);
    formData.append('actual_total', actualTotal.toString());

    const response = await axiosClient.post('/dataset/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
