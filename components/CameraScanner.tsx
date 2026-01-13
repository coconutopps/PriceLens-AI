import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, X, RefreshCw, Zap } from 'lucide-react';

interface CameraScannerProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
      }
      setError('');
    } catch (err) {
      console.error("Camera Access Error:", err);
      setError('Unable to access camera. Please ensure permissions are granted.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCamera]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        
        // Stop stream before proceeding
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        onCapture(imageData);
      }
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
        <p className="text-red-400 mb-4 text-center">{error}</p>
        <button 
          onClick={onClose}
          className="bg-secondary px-6 py-2 rounded-full text-white"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={onClose} className="p-2 bg-white/10 backdrop-blur-md rounded-full">
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="text-white font-medium bg-black/30 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          Scan Price Tag
        </div>
        <button onClick={switchCamera} className="p-2 bg-white/10 backdrop-blur-md rounded-full">
          <RefreshCw className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Video View */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Scanning Overlay Guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-accent/50 rounded-2xl relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-accent rounded-tl-lg -mt-1 -ml-1"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-accent rounded-tr-lg -mt-1 -mr-1"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-accent rounded-bl-lg -mb-1 -ml-1"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-accent rounded-br-lg -mb-1 -mr-1"></div>
            
            {/* Animated Scan Line */}
            <div className="absolute left-0 right-0 h-0.5 bg-accent/80 shadow-[0_0_15px_rgba(56,189,248,0.8)] animate-[scan_2s_ease-in-out_infinite] top-0"></div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-32 bg-black/90 flex items-center justify-center relative">
        <button 
          onClick={takePhoto}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group"
        >
          <div className="w-16 h-16 bg-white rounded-full group-active:scale-90 transition-transform duration-100"></div>
          <Zap className="absolute text-secondary w-8 h-8 opacity-0 group-active:opacity-100" />
        </button>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};