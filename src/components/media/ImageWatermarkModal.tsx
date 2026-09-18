'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Upload,
  Download,
  X,
  Image as ImageIcon,
  Sliders,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  Type,
} from 'lucide-react';
import { UnitProfile } from '@/lib/store/types';

interface ImageWatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: UnitProfile;
}

export const ImageWatermarkModal: React.FC<ImageWatermarkModalProps> = ({
  isOpen,
  onClose,
  unit,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [watermarkStyle, setWatermarkStyle] = useState<'banner' | 'shield'>('banner');
  const [logoPosition, setLogoPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-left');
  const [showBannerText, setShowBannerText] = useState(true);
  const [customBannerText, setCustomBannerText] = useState('CSGT ĐƯỜNG BỘ - PC08  CÔNG AN TỈNH VĨNH LONG');
  const [blurBoxes, setBlurBoxes] = useState<{ x: number; y: number; w: number; h: number }[]>([]);
  const [isDrawingBlur, setIsDrawingBlur] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (unit.short_name) {
      setCustomBannerText(unit.short_name.toUpperCase());
    }
  }, [unit]);

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      renderCanvas();
    }
  }, [imageSrc, watermarkStyle, logoPosition, showBannerText, customBannerText, blurBoxes]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setBlurBoxes([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.src = imageSrc;
    baseImg.onload = () => {
      // Set canvas dimensions
      canvas.width = baseImg.width;
      canvas.height = baseImg.height;

      // Draw original image
      ctx.drawImage(baseImg, 0, 0);

      // Draw blur/mask boxes (che mặt người vi phạm / biển số)
      blurBoxes.forEach(box => {
        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(box.x, box.y, box.w, box.h);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = Math.max(2, Math.floor(canvas.width / 500));
        ctx.strokeRect(box.x, box.y, box.w, box.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(12, Math.floor(box.h / 3))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ĐÃ ẨN DANH', box.x + box.w / 2, box.y + box.h / 2);
        ctx.restore();
      });

      // Load and draw selected Watermark Logo
      const logo = new Image();
      logo.src = watermarkStyle === 'banner' ? '/logo-watermark.png' : '/logo-csgt.png';
      logo.onload = () => {
        const padding = Math.max(14, Math.floor(canvas.width * 0.02));

        let logoWidth: number;
        let logoHeight: number;

        if (watermarkStyle === 'banner') {
          logoWidth = Math.max(160, Math.floor(canvas.width * 0.35));
          const aspect = logo.naturalHeight / (logo.naturalWidth || 1) || 0.28;
          logoHeight = Math.floor(logoWidth * aspect);
        } else {
          logoWidth = Math.max(80, Math.floor(canvas.width * 0.12));
          logoHeight = Math.floor(logoWidth * (logo.naturalHeight / (logo.naturalWidth || 1) || 1.25));
        }

        let logoX = padding;
        let logoY = padding;

        const bannerReserve = showBannerText ? Math.max(36, Math.floor(canvas.height * 0.055)) + 8 : 0;

        if (logoPosition === 'top-right') {
          logoX = canvas.width - logoWidth - padding;
          logoY = padding;
        } else if (logoPosition === 'bottom-left') {
          logoX = padding;
          logoY = canvas.height - logoHeight - padding - bannerReserve;
        } else if (logoPosition === 'bottom-right') {
          logoX = canvas.width - logoWidth - padding;
          logoY = canvas.height - logoHeight - padding - bannerReserve;
        }

        // Draw shadow for logo
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 10;
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
        ctx.restore();

        // Draw bottom badge banner if enabled
        if (showBannerText) {
          const bannerHeight = Math.max(36, Math.floor(canvas.height * 0.055));
          const fontSize = Math.max(13, Math.floor(bannerHeight * 0.45));

          ctx.save();
          // Gradient background banner at bottom
          const grad = ctx.createLinearGradient(0, canvas.height - bannerHeight, canvas.width, canvas.height);
          grad.addColorStop(0, 'rgba(15, 23, 42, 0.94)');
          grad.addColorStop(0.5, 'rgba(30, 58, 138, 0.96)');
          grad.addColorStop(1, 'rgba(15, 23, 42, 0.94)');

          ctx.fillStyle = grad;
          ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

          // Top gold border of banner
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, Math.max(2, Math.floor(bannerHeight * 0.08)));

          // Text
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`★ ${customBannerText} ★`, canvas.width / 2, canvas.height - bannerHeight / 2);
          ctx.restore();
        }
      };
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawingBlur(true);
    setStartPos({ x, y });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingBlur || !startPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    const x = Math.min(startPos.x, currentX);
    const y = Math.min(startPos.y, currentY);
    const w = Math.abs(currentX - startPos.x);
    const h = Math.abs(currentY - startPos.y);

    if (w > 10 && h > 10) {
      setBlurBoxes([...blurBoxes, { x, y, w, h }]);
    }

    setIsDrawingBlur(false);
    setStartPos(null);
  };

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CSGT_AnhTuyenTruyen_${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 selection:bg-amber-500">
      <div className="w-full max-w-5xl max-h-[95vh] rounded-2xl border border-slate-700 bg-[#0d1527] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#11192e]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white border-2 border-amber-400/90 p-0.5 flex items-center justify-center shadow-md shrink-0">
              <img src="/logo-csgt.png" alt="Logo CSGT" className="h-full w-full object-contain mix-blend-multiply" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                CÔNG CỤ XỬ LÝ ẢNH & ĐÓNG DẤU WATERMARK CSGT
              </h2>
              <p className="text-xs text-amber-300 font-semibold">
                CSGT Đường Bộ - PC08  Công an tỉnh Vĩnh Long
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Canvas Image Area */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center bg-slate-950/90 rounded-2xl border border-slate-800 p-4 min-h-[400px]">
            {imageSrc ? (
              <div className="relative max-w-full overflow-auto text-center">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  className="max-h-[60vh] max-w-full rounded-lg shadow-xl cursor-crosshair border border-slate-700"
                />
                <p className="text-[11px] text-amber-400/90 mt-2 font-medium">
                  💡 Kéo thả chuột trên ảnh để vẽ khung che mặt người vi phạm / biển số
                </p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-2xl cursor-pointer w-full transition-colors"
              >
                <div className="h-16 w-16 rounded-full bg-blue-950/60 border border-blue-700/60 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-sm font-bold text-white mb-1">
                  Bấm để tải ảnh hiện trường / tuần tra kiểm soát lên
                </p>
                <p className="text-xs text-slate-400">
                  Hỗ trợ định dạng JPG, PNG, WEBP (chất lượng cao)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Right 4 Cols: Settings & Actions */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3.5 text-xs">
              <h3 className="font-bold text-white uppercase text-xs flex items-center gap-1.5 pb-2 border-b border-slate-800">
                <Sliders className="h-4 w-4 text-amber-400" /> TÙY CHỌN LOGO & VIỀN
              </h3>

              {/* Watermark Logo Style Choice */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Mẫu Logo đóng dấu:</label>
                <div className="grid grid-cols-2 gap-2 font-medium">
                  <button
                    type="button"
                    onClick={() => setWatermarkStyle('banner')}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      watermarkStyle === 'banner'
                        ? 'bg-blue-600 text-white border-blue-400 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Logo + BỘ CÔNG AN
                  </button>
                  <button
                    type="button"
                    onClick={() => setWatermarkStyle('shield')}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      watermarkStyle === 'shield'
                        ? 'bg-blue-600 text-white border-blue-400 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Phù hiệu hình Khiên
                  </button>
                </div>
              </div>

              {/* Watermark Position */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="font-semibold text-slate-300">Vị trí đóng dấu Logo:</label>
                <div className="grid grid-cols-2 gap-2 font-medium">
                  {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(pos => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setLogoPosition(pos)}
                      className={`p-2 rounded-lg border text-center transition-colors ${
                        logoPosition === pos
                          ? 'bg-blue-600 text-white border-blue-400 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {pos === 'top-left' && 'Góc trên Trái'}
                      {pos === 'top-right' && 'Góc trên Phải'}
                      {pos === 'bottom-left' && 'Góc dưới Trái'}
                      {pos === 'bottom-right' && 'Góc dưới Phải'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unit Banner Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="font-semibold text-slate-300 flex items-center justify-between">
                  <span>Dải banner nhận diện đơn vị:</span>
                  <input
                    type="checkbox"
                    checked={showBannerText}
                    onChange={e => setShowBannerText(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>
                {showBannerText && (
                  <input
                    type="text"
                    value={customBannerText}
                    onChange={e => setCustomBannerText(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  />
                )}
              </div>

              {blurBoxes.length > 0 && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-300">
                  <span>Đã che: <strong>{blurBoxes.length}</strong> vùng</span>
                  <button
                    type="button"
                    onClick={() => setBlurBoxes([])}
                    className="text-red-400 hover:underline text-[11px]"
                  >
                    Xóa các vùng che
                  </button>
                </div>
              )}
            </div>

            {imageSrc && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                >
                  Chọn ảnh khác
                </button>

                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-extrabold shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 border border-emerald-500/40 cursor-pointer"
                >
                  <Download className="h-4 w-4" /> TẢI ẢNH ĐÃ ĐÓNG DẤU CSGT VỀ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
