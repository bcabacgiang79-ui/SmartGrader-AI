
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { Upload, Loader2, Wand2, RefreshCw } from 'lucide-react';

const EditorView: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Làm rõ các nét chữ và tăng độ tương phản của bài làm.');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !prompt) return;
    setLoading(true);
    try {
      const result = await GeminiService.editImage(originalImage, prompt);
      if (result) setEditedImage(result);
    } catch (error) {
      console.error("Editing failed", error);
      alert("Chỉnh sửa ảnh thất bại. Thử câu lệnh khác nhé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Chỉnh sửa ảnh bằng AI</h2>
        <p className="text-slate-500">Sử dụng Gemini 2.5 Flash Image để làm sạch ảnh chụp bài làm mờ nhạt.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            className="flex-1 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ví dụ: Thêm bộ lọc retro, xóa phông nền, làm sắc nét văn bản..."
          />
          <button
            onClick={handleEdit}
            disabled={!originalImage || loading}
            className={`px-8 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              !originalImage || loading ? 'bg-slate-300' : 'bg-purple-600 hover:bg-purple-700 shadow-lg'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
            <span>Xử lý</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Original */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Ảnh gốc</h4>
            {!originalImage ? (
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl aspect-[4/3] flex flex-col items-center justify-center p-8 bg-slate-50">
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload className="text-slate-300 mb-2" size={32} />
                <p className="text-slate-400 text-sm">Tải ảnh lên để bắt đầu</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100">
                <img src={originalImage} className="w-full h-full object-contain" />
                <button 
                  onClick={() => setOriginalImage(null)}
                  className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-lg text-red-500 hover:bg-white"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Edited */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Kết quả xử lý</h4>
            <div className={`relative border border-slate-200 rounded-2xl aspect-[4/3] flex items-center justify-center bg-slate-50 overflow-hidden`}>
              {loading ? (
                <div className="text-center">
                  <Loader2 className="animate-spin text-purple-600 mx-auto mb-2" size={32} />
                  <p className="text-sm text-slate-500">Đang thực hiện phép thuật AI...</p>
                </div>
              ) : editedImage ? (
                <img src={editedImage} className="w-full h-full object-contain" />
              ) : (
                <p className="text-slate-300 text-sm">Chưa có kết quả</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorView;
