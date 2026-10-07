import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Crop,
  RotateCw,
  Check,
  RefreshCw,
  Lock,
  Unlock,
  Move,
  Maximize2
} from 'lucide-react';

interface CardPhotoCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

type DragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e' | null;
type AspectRatioMode = 'card' | 'free' | '16:9' | '1:1';

export const CardPhotoCropModal: React.FC<CardPhotoCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}) => {
  // Container & Image dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Transformation states
  const [rotation, setRotation] = useState<number>(0);
  const [aspectMode, setAspectMode] = useState<AspectRatioMode>('card');

  // Display image bounding rect inside container
  const [imageLayout, setImageLayout] = useState<{
    width: number;
    height: number;
    left: number;
    top: number;
    naturalWidth: number;
    naturalHeight: number;
  }>({ width: 0, height: 0, left: 0, top: 0, naturalWidth: 1, naturalHeight: 1 });

  // Crop Box Coordinates relative to image display (x, y, width, height)
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 200,
    height: 126,
  });

  // Drag interaction states
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStart, setDragStart] = useState<{
    pointerX: number;
    pointerY: number;
    box: { x: number; y: number; width: number; height: number };
  }>({
    pointerX: 0,
    pointerY: 0,
    box: { x: 0, y: 0, width: 200, height: 126 },
  });

  const CARD_RATIO = 1.5858; // ISO standard credit card ratio
  const MIN_CROP_SIZE = 40;

  // Initialize or re-layout image when imageSrc or rotation changes
  const initLayout = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return;
    const img = imgRef.current;
    const container = containerRef.current;

    const contWidth = container.clientWidth || 520;
    const contHeight = container.clientHeight || 360;

    let natW = img.naturalWidth || 800;
    let natH = img.naturalHeight || 500;

    // Handle rotation dimensions
    if (rotation === 90 || rotation === 270) {
      const temp = natW;
      natW = natH;
      natH = temp;
    }

    // Scale to fit container while preserving aspect ratio
    const scale = Math.min((contWidth - 32) / natW, (contHeight - 32) / natH);
    const dispW = Math.round(natW * scale);
    const dispH = Math.round(natH * scale);
    const dispLeft = Math.round((contWidth - dispW) / 2);
    const dispTop = Math.round((contHeight - dispH) / 2);

    setImageLayout({
      width: dispW,
      height: dispH,
      left: dispLeft,
      top: dispTop,
      naturalWidth: img.naturalWidth || 800,
      naturalHeight: img.naturalHeight || 500,
    });

    // Default crop box: centered, standard card ratio
    let initBoxW = dispW * 0.88;
    let initBoxH = initBoxW / CARD_RATIO;
    if (initBoxH > dispH * 0.88) {
      initBoxH = dispH * 0.88;
      initBoxW = initBoxH * CARD_RATIO;
    }

    setCropBox({
      x: Math.round((dispW - initBoxW) / 2),
      y: Math.round((dispH - initBoxH) / 2),
      width: Math.round(initBoxW),
      height: Math.round(initBoxH),
    });
  }, [rotation]);

  useEffect(() => {
    if (isOpen && imageSrc) {
      setRotation(0);
      setAspectMode('card');
      const timer = setTimeout(initLayout, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, imageSrc, initLayout]);

  if (!isOpen || !imageSrc) return null;

  // Handle Pointer Down on handles or body
  const handlePointerDown = (e: React.PointerEvent, mode: DragMode) => {
    e.stopPropagation();
    e.preventDefault();
    setDragMode(mode);
    setDragStart({
      pointerX: e.clientX,
      pointerY: e.clientY,
      box: { ...cropBox },
    });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  // Handle Drag / Resize on Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragMode || imageLayout.width === 0) return;

    const dx = e.clientX - dragStart.pointerX;
    const dy = e.clientY - dragStart.pointerY;
    const start = dragStart.box;
    const maxW = imageLayout.width;
    const maxH = imageLayout.height;

    const targetRatio =
      aspectMode === 'card'
        ? CARD_RATIO
        : aspectMode === '16:9'
        ? 16 / 9
        : aspectMode === '1:1'
        ? 1
        : null;

    let newX = start.x;
    let newY = start.y;
    let newW = start.width;
    let newH = start.height;

    // 1. Move entire crop area
    if (dragMode === 'move') {
      newX = Math.max(0, Math.min(start.x + dx, maxW - start.width));
      newY = Math.max(0, Math.min(start.y + dy, maxH - start.height));
      setCropBox({ x: newX, y: newY, width: start.width, height: start.height });
      return;
    }

    // 2. Corner & Edge Resizing
    if (dragMode === 'se' || dragMode === 'e' || dragMode === 's') {
      if (dragMode === 'e' || dragMode === 'se') {
        newW = Math.max(MIN_CROP_SIZE, Math.min(start.width + dx, maxW - start.x));
      }
      if (dragMode === 's' || dragMode === 'se') {
        newH = Math.max(MIN_CROP_SIZE, Math.min(start.height + dy, maxH - start.y));
      }

      if (targetRatio) {
        if (dragMode === 'e') {
          newH = newW / targetRatio;
          if (newY + newH > maxH) {
            newH = maxH - newY;
            newW = newH * targetRatio;
          }
        } else {
          newH = newW / targetRatio;
          if (newY + newH > maxH) {
            newH = maxH - newY;
            newW = newH * targetRatio;
          }
        }
      }
    } else if (dragMode === 'sw' || dragMode === 'w') {
      const prospectiveW = start.width - dx;
      const clampedW = Math.max(MIN_CROP_SIZE, Math.min(prospectiveW, start.x + start.width));
      newX = start.x + (start.width - clampedW);
      newW = clampedW;

      if (dragMode === 'sw') {
        newH = Math.max(MIN_CROP_SIZE, Math.min(start.height + dy, maxH - start.y));
      }

      if (targetRatio) {
        newH = newW / targetRatio;
        if (newY + newH > maxH) {
          newH = maxH - newY;
          newW = newH * targetRatio;
          newX = start.x + (start.width - newW);
        }
      }
    } else if (dragMode === 'ne') {
      newW = Math.max(MIN_CROP_SIZE, Math.min(start.width + dx, maxW - start.x));
      const prospectiveH = start.height - dy;
      const clampedH = Math.max(MIN_CROP_SIZE, Math.min(prospectiveH, start.y + start.height));
      newY = start.y + (start.height - clampedH);
      newH = clampedH;

      if (targetRatio) {
        newH = newW / targetRatio;
        newY = start.y + (start.height - newH);
        if (newY < 0) {
          newY = 0;
          newH = start.y + start.height;
          newW = newH * targetRatio;
        }
      }
    } else if (dragMode === 'nw') {
      const prospectiveW = start.width - dx;
      const clampedW = Math.max(MIN_CROP_SIZE, Math.min(prospectiveW, start.x + start.width));
      newX = start.x + (start.width - clampedW);
      newW = clampedW;

      const prospectiveH = start.height - dy;
      const clampedH = Math.max(MIN_CROP_SIZE, Math.min(prospectiveH, start.y + start.height));
      newY = start.y + (start.height - clampedH);
      newH = clampedH;

      if (targetRatio) {
        newH = newW / targetRatio;
        newY = start.y + (start.height - newH);
        if (newY < 0) {
          newY = 0;
          newH = start.y + start.height;
          newW = newH * targetRatio;
          newX = start.x + (start.width - newW);
        }
      }
    } else if (dragMode === 'n') {
      const prospectiveH = start.height - dy;
      const clampedH = Math.max(MIN_CROP_SIZE, Math.min(prospectiveH, start.y + start.height));
      newY = start.y + (start.height - clampedH);
      newH = clampedH;

      if (targetRatio) {
        newW = newH * targetRatio;
        if (newX + newW > maxW) {
          newW = maxW - newX;
          newH = newW / targetRatio;
          newY = start.y + (start.height - newH);
        }
      }
    }

    setCropBox({
      x: Math.max(0, Math.round(newX)),
      y: Math.max(0, Math.round(newY)),
      width: Math.max(MIN_CROP_SIZE, Math.round(newW)),
      height: Math.max(MIN_CROP_SIZE, Math.round(newH)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragMode(null);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  // Change Aspect Ratio Preset
  const handleSetAspect = (mode: AspectRatioMode) => {
    setAspectMode(mode);
    const targetRatio =
      mode === 'card'
        ? CARD_RATIO
        : mode === '16:9'
        ? 16 / 9
        : mode === '1:1'
        ? 1
        : null;

    if (!targetRatio) return; // Freeform: keep current width & height

    const maxW = imageLayout.width;
    const maxH = imageLayout.height;
    let newW = cropBox.width;
    let newH = newW / targetRatio;

    if (newH > maxH) {
      newH = maxH * 0.9;
      newW = newH * targetRatio;
    }
    if (newW > maxW) {
      newW = maxW * 0.9;
      newH = newW / targetRatio;
    }

    const newX = Math.max(0, Math.min(cropBox.x, maxW - newW));
    const newY = Math.max(0, Math.min(cropBox.y, maxH - newH));

    setCropBox({
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newW),
      height: Math.round(newH),
    });
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Apply Final High-Definition Canvas Crop
  const handleApplyCrop = () => {
    const img = imgRef.current;
    if (!img || imageLayout.width === 0) return;

    // Standard credit card target resolution: 856 x 540
    const targetW = 856;
    const targetH = 540;

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill dark card background
    ctx.fillStyle = '#080c1e';
    ctx.fillRect(0, 0, targetW, targetH);

    // Create an intermediate canvas for the rotated image
    const rotCanvas = document.createElement('canvas');
    const rotCtx = rotCanvas.getContext('2d');
    if (!rotCtx) return;

    const origW = img.naturalWidth || 800;
    const origH = img.naturalHeight || 500;

    if (rotation === 90 || rotation === 270) {
      rotCanvas.width = origH;
      rotCanvas.height = origW;
    } else {
      rotCanvas.width = origW;
      rotCanvas.height = origH;
    }

    rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
    rotCtx.rotate((rotation * Math.PI) / 180);
    rotCtx.drawImage(img, -origW / 2, -origH / 2, origW, origH);

    // Map screen crop coordinates back to rotated canvas natural coordinates
    const scale = rotCanvas.width / imageLayout.width;
    const sourceX = cropBox.x * scale;
    const sourceY = cropBox.y * scale;
    const sourceW = cropBox.width * scale;
    const sourceH = cropBox.height * scale;

    // Draw the cropped area to target canvas with cover-fit
    ctx.drawImage(
      rotCanvas,
      sourceX,
      sourceY,
      sourceW,
      sourceH,
      0,
      0,
      targetW,
      targetH
    );

    // Subtle glossy card lighting gradient
    const sheen = ctx.createLinearGradient(0, 0, targetW, targetH * 0.45);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, targetW, targetH * 0.45);

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.93);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090e24] border-2 border-purple-500/60 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-[#0d1433] shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/40">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>एडजस्टेबल क्रॉप टूल (All Sides &amp; Corners Cropper)</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                कोनों और किनारों को पकड़कर किसी भी तरफ से खींचें (Side &amp; Corner Handles)
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

        {/* Viewport Workspace */}
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-[#050814] flex items-center justify-center overflow-hidden p-4 select-none touch-none"
        >
          {/* Natural Image element (hidden from visual display, used for source) */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Source"
            onLoad={initLayout}
            className="hidden"
          />

          {/* Rendered Display Canvas Area */}
          {imageLayout.width > 0 && (
            <div
              className="relative shadow-2xl"
              style={{
                width: `${imageLayout.width}px`,
                height: `${imageLayout.height}px`,
              }}
            >
              {/* Rotated & Sized Image */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
              >
                <img
                  src={imageSrc}
                  alt="Crop preview"
                  draggable={false}
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </div>

              {/* Darkened Overlay Mask: Top */}
              <div
                className="absolute top-0 left-0 right-0 bg-black/65 pointer-events-none"
                style={{ height: `${cropBox.y}px` }}
              />
              {/* Darkened Overlay Mask: Bottom */}
              <div
                className="absolute left-0 right-0 bottom-0 bg-black/65 pointer-events-none"
                style={{ height: `${imageLayout.height - (cropBox.y + cropBox.height)}px` }}
              />
              {/* Darkened Overlay Mask: Left */}
              <div
                className="absolute left-0 bg-black/65 pointer-events-none"
                style={{
                  top: `${cropBox.y}px`,
                  height: `${cropBox.height}px`,
                  width: `${cropBox.x}px`,
                }}
              />
              {/* Darkened Overlay Mask: Right */}
              <div
                className="absolute right-0 bg-black/65 pointer-events-none"
                style={{
                  top: `${cropBox.y}px`,
                  height: `${cropBox.height}px`,
                  width: `${imageLayout.width - (cropBox.x + cropBox.width)}px`,
                }}
              />

              {/* ACTIVE CROP BOX WITH 8 HANDLES */}
              <div
                className="absolute border-2 border-emerald-400 shadow-xl cursor-move group"
                style={{
                  left: `${cropBox.x}px`,
                  top: `${cropBox.y}px`,
                  width: `${cropBox.width}px`,
                  height: `${cropBox.height}px`,
                }}
                onPointerDown={(e) => handlePointerDown(e, 'move')}
              >
                {/* Rule of Thirds Grid Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <div className="absolute left-1/3 top-0 bottom-0 border-l border-dashed border-white/70" />
                  <div className="absolute left-2/3 top-0 bottom-0 border-l border-dashed border-white/70" />
                  <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-white/70" />
                  <div className="absolute top-2/3 left-0 right-0 border-t border-dashed border-white/70" />
                </div>

                {/* Center Move Indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white/80 pointer-events-none">
                  <Move className="w-3.5 h-3.5" />
                </div>

                {/* 4 CORNER HANDLES */}
                {/* 1. Top-Left Corner */}
                <div
                  className="absolute -top-2 -left-2 w-5 h-5 bg-white border-2 border-purple-600 rounded-sm cursor-nw-resize shadow-md hover:scale-125 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, 'nw')}
                />
                {/* 2. Top-Right Corner */}
                <div
                  className="absolute -top-2 -right-2 w-5 h-5 bg-white border-2 border-purple-600 rounded-sm cursor-ne-resize shadow-md hover:scale-125 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, 'ne')}
                />
                {/* 3. Bottom-Left Corner */}
                <div
                  className="absolute -bottom-2 -left-2 w-5 h-5 bg-white border-2 border-purple-600 rounded-sm cursor-sw-resize shadow-md hover:scale-125 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, 'sw')}
                />
                {/* 4. Bottom-Right Corner */}
                <div
                  className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-2 border-purple-600 rounded-sm cursor-se-resize shadow-md hover:scale-125 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, 'se')}
                />

                {/* 4 SIDE / EDGE HANDLES */}
                {/* 5. Top Side Handle */}
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-emerald-400 border border-white rounded-full cursor-n-resize shadow-md hover:scale-125 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, 'n')}
                />
                {/* 6. Bottom Side Handle */}
                <div
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-emerald-400 border border-white rounded-full cursor-s-resize shadow-md hover:scale-125 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, 's')}
                />
                {/* 7. Left Side Handle */}
                <div
                  className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3.5 h-8 bg-emerald-400 border border-white rounded-full cursor-w-resize shadow-md hover:scale-125 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, 'w')}
                />
                {/* 8. Right Side Handle */}
                <div
                  className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-8 bg-emerald-400 border border-white rounded-full cursor-e-resize shadow-md hover:scale-125 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, 'e')}
                />

                {/* Live Dimension Badge */}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-emerald-300 font-mono font-bold whitespace-nowrap pointer-events-none border border-emerald-500/40">
                  {cropBox.width} &times; {cropBox.height} px
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="p-3.5 sm:p-4 bg-[#0a102b] border-t border-slate-800 space-y-3 shrink-0">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">
                Aspect Ratio:
              </span>

              {/* 1. Card Ratio (1.58:1) */}
              <button
                type="button"
                onClick={() => handleSetAspect('card')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 cursor-pointer ${
                  aspectMode === 'card'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Card (1.58:1)</span>
              </button>

              {/* 2. Freeform (Any corner/side freely) */}
              <button
                type="button"
                onClick={() => handleSetAspect('free')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 cursor-pointer ${
                  aspectMode === 'free'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Unlock className="w-3 h-3" />
                <span>Freeform (फ्री साइज़)</span>
              </button>

              {/* 3. 16:9 Wide */}
              <button
                type="button"
                onClick={() => handleSetAspect('16:9')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  aspectMode === '16:9'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                16:9
              </button>

              {/* 4. 1:1 Square */}
              <button
                type="button"
                onClick={() => handleSetAspect('1:1')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  aspectMode === '1:1'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                1:1
              </button>
            </div>

            {/* Rotation & Reset Controls */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleRotate}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                title="Rotate 90 degrees"
              >
                <RotateCw className="w-3.5 h-3.5 text-purple-400" />
                <span>Rotate 90&deg;</span>
              </button>

              <button
                type="button"
                onClick={initLayout}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                title="Reset Crop to Full"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                onCropComplete(imageSrc);
                onClose();
              }}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer py-1"
            >
              Use As-Is (बिना क्रॉप किए लगाएं)
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Apply Crop (क्रॉप करके सेट करें)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
