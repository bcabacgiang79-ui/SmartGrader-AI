
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { ImageSize, AspectRatio } from '../types';
import { Sparkles, Loader2, Download, ExternalLink } from 'lucide-react';

const GeneratorView: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Một tấm bằng khen vinh danh học sinh xuất sắc, phong cách trang nhã, màu xanh dương và vàng kim.');
  const [size, setSize] = useState<ImageSize>('2K');
  const [ratio, setRatio] = useState<AspectRatio>('4:3');
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const result = await GeminiService.generateHighResImage(prompt, size, ratio);
      if (result) setGeneratedImage(result);
    } catch (error: any) {
      if (error.message === "API_KEY_RESET") {
        if (typeof (window as any).aistudio?.openSelectKey === 'function') {
          alert("Vui lòng chọn lại API Key có hỗ trợ Gemini 3 Pro Image.");
          (window as any).aistudio.openSelectKey();
        }
      } else {
        console.error("Generation failed", error);
        alert("Không thể tạo ảnh. Vui lòng kiểm tra lại cấu hình API.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Tạo ảnh chất lượng cao</h2>
        <p className="text-slate-500">Sử dụng Gemini 3 Pro Image để tạo chứng chỉ hoặc tài liệu học tập 1K, 2K, 4K.</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit font-medium">
          <Sparkles size={14} />
          Yêu cầu API Key từ GCP dự án trả phí
        </div>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">Mô tả ảnh muốn tạo</label>
            <textarea
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Nhập mô tả chi tiết..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Độ phân giải</label>
              <div className="flex gap-2">
                {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`flex-1 py-2 rounded-lg border font-bold transition-all ${
                      size === s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Tỷ lệ khung hình</label>
              <select
                className="w-full p-2 border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
                value={ratio}
                onChange={(e) => setRatio(e.target.value as AspectRatio)}
              >
                <option value="1:1">1:1 (Vuông)</option>
                <option value="4:3">4:3 (Cơ bản)</option>
                <option value="16:9">16:9 (Ngang)</option>
                <option value="9:16">9:16 (Dọc)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              loading || !prompt ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            <span>{loading ? 'Đang khởi tạo ảnh...' : 'Tạo ảnh ngay'}</span>
          </button>
        </div>

        {/* Display Result */}
        <div className="mt-8 pt-8 border-t border-slate-100">
          <div className="relative border-2 border-slate-100 rounded-2xl bg-slate-50 min-h-[400px] flex items-center justify-center overflow-hidden">
            {loading ? (
              <div className="text-center">
                <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                <p className="text-slate-500">Mẫu thiết kế đang được kiến tạo...</p>
              </div>
            ) : generatedImage ? (
              <>
                <img src={generatedImage} className="max-w-full max-h-[600px] shadow-2xl" />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <a
                    href={generatedImage}
                    download="generated-image.png"
                    className="p-3 bg-white/90 backdrop-blur rounded-xl text-slate-700 shadow-lg hover:bg-white transition-all"
                  >
                    <Download size={20} />
                  </a>
                  <button className="p-3 bg-white/90 backdrop-blur rounded-xl text-slate-700 shadow-lg hover:bg-white transition-all">
                    <ExternalLink size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-300">
                <ImageIcon size={64} strokeWidth={1} className="mx-auto mb-4" />
                <p>Ảnh kết quả sẽ xuất hiện ở đây</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-xs text-amber-700 font-medium">
            Lưu ý: Để sử dụng model Gemini 3 Pro Image, bạn cần thiết lập dự án thanh toán trên Google Cloud.
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-1">Xem hướng dẫn</a>
          </p>
        </div>
      </div>
    </div>
  );
};

import { Image as ImageIcon } from 'lucide-react';

export default GeneratorView;
