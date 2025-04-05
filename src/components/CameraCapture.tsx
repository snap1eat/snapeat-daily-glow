
import { useRef, useState, useEffect } from 'react';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera as CameraIcon, X, Image as ImageIcon } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CameraCapture = ({ onCapture, open, onOpenChange }: CameraCaptureProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const handleTakePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl
      });
      
      if (image.dataUrl) {
        setCapturedImage(image.dataUrl);
      }
    } catch (e) {
      console.error('Error capturing photo:', e);
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: 'PHOTOS'
      });
      
      if (image.dataUrl) {
        setCapturedImage(image.dataUrl);
      }
    } catch (e) {
      console.error('Error selecting photo:', e);
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setCapturedImage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir foto</DialogTitle>
        </DialogHeader>
        
        {capturedImage ? (
          <div className="flex flex-col gap-4">
            <div className="relative rounded-md overflow-hidden">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full object-cover" 
              />
              <button 
                className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full"
                onClick={() => setCapturedImage(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm}>
                Confirmar
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleTakePhoto}
              className="flex flex-col items-center py-6 h-auto"
              variant="outline"
            >
              <CameraIcon className="h-8 w-8 mb-2" />
              <span>Tomar Foto</span>
            </Button>
            <Button 
              onClick={handleChooseFromGallery}
              className="flex flex-col items-center py-6 h-auto"
              variant="outline"
            >
              <ImageIcon className="h-8 w-8 mb-2" />
              <span>Galería</span>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
