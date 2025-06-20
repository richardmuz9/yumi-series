import React, { useRef, useState } from 'react';
import CropperModal from './CropperModal';
import { sobelEdgeDetection } from './sobelEdgeDetection';

interface OutlineUploadModalProps {
  onClose: () => void;
  onOutlineProcessed: (outlineData: string) => void;
}

const OutlineUploadModal: React.FC<OutlineUploadModalProps> = ({ onClose, onOutlineProcessed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedOutline, setProcessedOutline] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target?.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = () => {
    fileInputRef.current?.setAttribute('capture', 'environment');
    fileInputRef.current?.click();
  };

  const handleSelectFromGallery = () => {
    fileInputRef.current?.removeAttribute('capture');
    fileInputRef.current?.click();
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    setShowCropper(false);
    setProcessing(true);
    try {
      const outline = await sobelEdgeDetection(croppedDataUrl);
      setProcessedOutline(outline);
    } catch (err) {
      alert('Failed to process outline.');
      onClose();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>📷 Upload Outline</h3>
        {processing && <p>Processing outline...</p>}
        {!selectedImage && !processing && (
          <>
            <button onClick={handleTakePhoto}>Take Photo</button>
            <button onClick={handleSelectFromGallery}>Select from Gallery</button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button onClick={onClose}>Cancel</button>
          </>
        )}
        {selectedImage && showCropper && !processing && (
          <CropperModal
            image={selectedImage}
            onCropComplete={handleCropComplete}
            onCancel={onClose}
          />
        )}
        {processedOutline && !processing && (
          <div>
            <p>Preview processed outline:</p>
            <img src={processedOutline} alt="Processed Outline" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
            <button onClick={() => onOutlineProcessed(processedOutline!)}>Import to Canvas</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlineUploadModal; 