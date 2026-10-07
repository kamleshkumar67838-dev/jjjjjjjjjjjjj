import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Check,
  Move,
  Maximize2,
  RefreshCw,
  CreditCard
} from 'lucide-react';

interface CardPhotoCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const CardPhotoCropModal: React.FC<CardPhotoCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Standard ISO/IEC 7810 credit card aspect ratio: 85.60 mm / 53.98 mm = 1.5858
  const CARD_RATIO = 1.586;
  const CROP_WIDTH = 460;
  const CROP_HEIGHT = Math.round(CROP_WIDTH / CARD_RATIO); // ~290px

  // Reset controls when a new image is opened
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  // Pointer drag handling
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if not captured
    }
  };

  // Zoom controls
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(0.5, Math.min(3.5, Number(newZoom.toFixed(2)))));
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset adjustments
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Perform Final High-Resolution Canvas Crop
  const handleApplyCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    // Output target resolution: 856 x 540 (exact 1.585 ratio, crisp retina card quality)
    const targetWidth = 856;
    const targetHeight = 540;

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill clean dark background
    ctx.fillStyle = '#0a0e23';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Calculate scale factor from preview container to output canvas
    const scaleFactor = targetWidth / CROP_WIDTH;

    ctx.save();
    // Translate to center of output canvas
    ctx.translate(targetWidth / 2, targetHeight / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply pan and zoom
    ctx.translate(position.x * scaleFactor, position.y * scaleFactor);
    ctx.scale(zoom * scaleFactor, zoom * scaleFactor);

    // Draw the image centered
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    // Render scaled to fit crop frame initially
    const fitScale = Math.max(CROP_WIDTH / imgW, CROP_HEIGHT / imgH);
    const drawW = imgW * fitScale;
    const drawH = imgH * fitScale;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();

    // Export high-quality JPEG
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#090e24] border-2 border-purple-500/60 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0d1433]">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/40">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <span>कार्ड फोटो क्रॉप और साइज़ टूल (Card Photo Cropper)</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                ड्रैग करके फोटो सेट करें और ज़ूम से परफेक्ट कार्ड साइज़ में लाएं
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Workspace */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-[#050816] select-none">
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-2xl border-2 border-dashed border-purple-400 shadow-2xl shadow-purple-950/80 cursor-grab active:cursor-grabbing bg-slate-950"
            style={{
              width: `${CROP_WIDTH}px`,
              maxWidth: '100%',
              height: `${CROP_HEIGHT}px`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* The Image being transformed */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Source for crop"
                draggable={false}
                className="max-w-none pointer-events-none select-none"
                style={{
                  width: `${CROP_WIDTH}px`,
                  height: 'auto',
                }}
              />
            </div>

            {/* Credit Card Outline Grid / Frame Overlays */}
            <div className="absolute inset-0 pointer-events-none border-2 border-white/40 rounded-2xl">
              {/* EMV Chip outline simulator */}
              <div className="absolute top-8 left-6 w-11 h-8 rounded-md border border-yellow-400/60 bg-yellow-500/10 backdrop-blur-[1px] flex items-center justify-center">
                <div className="w-6 h-5 border border-yellow-400/40 rounded-xs" />
              </div>

              {/* Card Network Logo Placeholder */}
              <div className="absolute bottom-6 right-6 px-2 py-0.5 rounded bg-black/40 border border-white/20 text-[10px] font-bold text-white/80">
                CARD SKIN
              </div>

              {/* Center crosshair / guide */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-white/20 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
              </div>
            </div>

            {/* Draggable notice pill */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] text-slate-300 font-mono flex items-center space-x-1 pointer-events-none">
              <Move className="w-2.5 h-2.5 text-purple-400" />
              <span>Drag to move • Standard 1.58:1 Ratio</span>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="p-4 bg-[#0a102b] border-t border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center space-x-1">
                  <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Zoom / Scale (साइज़)</span>
                </span>
                <span className="font-mono text-purple-300">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleZoomChange(zoom - 0.15)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="flex-1 accent-purple-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleZoomChange(zoom + 0.15)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rotate & Reset Buttons */}
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={handleRotate}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                title="Rotate image 90 degrees"
              >
                <RotateCw className="w-3.5 h-3.5 text-purple-400" />
                <span>Rotate 90&deg;</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                title="Reset zoom and position"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Apply &amp; Fit to Card (क्रॉप करके सेट करें)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
