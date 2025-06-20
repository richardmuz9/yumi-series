import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';

interface CropperModalProps {
  image: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

const CropperModal: React.FC<CropperModalProps> = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onCropChange = (newCrop: any) => setCrop(newCrop);
  const onZoomChange = (newZoom: number) => setZoom(newZoom);
  const onCropCompleteInternal = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async () => {
    const imageElement = imgRef.current;
    if (!imageElement || !croppedAreaPixels) return;
    const canvas = document.createElement('canvas');
    const scaleX = imageElement.naturalWidth / imageElement.width;
    const scaleY = imageElement.naturalHeight / imageElement.height;
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(
      imageElement,
      croppedAreaPixels.x * scaleX,
      croppedAreaPixels.y * scaleY,
      croppedAreaPixels.width * scaleX,
      croppedAreaPixels.height * scaleY,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
    return canvas.toDataURL('image/png');
  };

  const handleConfirm = async () => {
    const croppedDataUrl = await getCroppedImg();
    if (croppedDataUrl) {
      onCropComplete(croppedDataUrl);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Crop Outline</h3>
        <div style={{ position: 'relative', width: '100%', height: 300, background: '#222' }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteInternal}
          />
          <img
            ref={imgRef}
            src={image}
            alt="hidden"
            style={{ display: 'none' }}
            onLoad={() => {}}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <button onClick={handleConfirm}>Confirm Crop</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CropperModal; 