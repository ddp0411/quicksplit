// OCR Upload component
import { useState } from 'react';
import { useOCR } from '../../hooks/useOCR';

export const OCRUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const { uploadReceipt } = useOCR();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      await uploadReceipt(file);
    }
  };

  return (
    <div className="w-full">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>
        Upload & Process
      </button>
    </div>
  );
};

