
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { GradingResponse } from '../types';
import { Upload, Loader2, CheckCircle, XCircle, FileText, FileJson, Printer, Key, User, Trash2 } from 'lucide-react';

const GraderView: React.FC = () => {
  const [studentImage, setStudentImage] = useState<string | null>(null);
  const [keyImage, setKeyImage] = useState<string | null>(null);
  const [answerKeyText, setAnswerKeyText] = useState<string>('1A, 2B, 3C, 4D, 5A');
  const [useKeyImage, setUseKeyImage] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GradingResponse | null>(null);

  const handleStudentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setKeyImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGrade = async () => {
    if (!studentImage) return;
    if (useKeyImage && !keyImage) {
      alert("Vui lòng tải lên ảnh đáp án mẫu.");
      return;
    }
    
    setLoading(true);
    try {
      const gradingData = await GeminiService.gradeTest(
        studentImage, 
        useKeyImage ? "" : answerKeyText, 
        useKeyImage ? keyImage : null
      );
      setResult(gradingData);
    } catch (error) {
      console.error("Grading failed", error);
      alert("Đã xảy ra lỗi khi chấm bài. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const exportToJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ket_qua_cham_bai_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header className="no-print">
        <h2 className="text-3xl font-bold text-slate-900">Chấm bài trắc nghiệm AI</h2>
        <p className="text-slate-500">Tự động nhận diện đáp án từ ảnh mẫu hoặc nhập tay.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input */}
        <div className="space-y-6 no-print">
          {/* Answer Key Method Selection */}
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 flex gap-1">
            <button
              onClick={() => setUseKeyImage(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                useKeyImage ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Key size={18} /> Quét ảnh đáp án
            </button>
            <button
              onClick={() => setUseKeyImage(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                !useKeyImage ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FileText size={18} /> Nhập đáp án tay
            </button>
          </div>

          {/* Key Input Area */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            {useKeyImage ? (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">1. Ảnh đáp án mẫu (Master Key)</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={handleKeyFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {!keyImage ? (
                    <div className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-6 flex flex-col items-center justify-center gap-2 group-hover:border-blue-400 transition-colors">
                      <Key className="text-blue-400" size={32} />
                      <p className="text-xs text-blue-600 font-medium">Tải ảnh bài đã điền đúng hoàn toàn</p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-blue-200 aspect-video">
                      <img src={keyImage} className="w-full h-full object-contain bg-slate-50" />
                      <button onClick={() => setKeyImage(null)} className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-lg text-red-500 z-20"><Trash2 size={16}/></button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">1. Nhập danh sách đáp án</label>
                <textarea
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24"
                  value={answerKeyText}
                  onChange={(e) => setAnswerKeyText(e.target.value)}
                  placeholder="Ví dụ: 1A, 2B, 3C..."
                />
              </div>
            )}
          </div>

          {/* Student Paper Upload */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-4">2. Ảnh bài làm học sinh</label>
            <div className="relative group">
              <input type="file" accept="image/*" onChange={handleStudentFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              {!studentImage ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center gap-3 group-hover:border-blue-400 transition-colors">
                  <User className="text-slate-400" size={32} />
                  <p className="text-sm text-slate-500 font-medium text-center">Tải ảnh bài làm cần chấm</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200">
                  <img src={studentImage} className="w-full h-auto max-h-80 object-contain bg-slate-50" />
                  <button onClick={() => setStudentImage(null)} className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-lg text-red-500 z-20"><Trash2 size={16}/></button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleGrade}
            disabled={!studentImage || loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              !studentImage || loading ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
            <span>{loading ? 'Đang phân tích hai ảnh...' : 'Bắt đầu chấm bài'}</span>
          </button>
        </div>

        {/* Right Column: Results */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 printable-area">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Kết quả chấm bài
              {result && <span className="ml-2 text-blue-600 font-mono text-2xl">{result.score}/10</span>}
            </h3>
            
            {result && (
              <div className="flex gap-2 no-print">
                <button onClick={exportToJson} title="Xuất JSON" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><FileJson size={20} /></button>
                <button onClick={() => window.print()} title="In kết quả" className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"><Printer size={20} /></button>
              </div>
            )}
          </div>

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 no-print">
              <FileText size={48} strokeWidth={1} />
              <p className="mt-4 text-center">Hoàn thành tải ảnh bên trái để xem kết quả.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 no-print">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-slate-500 text-center animate-pulse">
                {useKeyImage ? 'Đang trích xuất đáp án từ ảnh mẫu và đối soát...' : 'Đang chấm điểm bài làm...'}
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-center flex-1">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tổng câu</p>
                  <p className="text-xl font-bold text-slate-800">{result.totalQuestions}</p>
                </div>
                <div className="w-px bg-slate-200" />
                <div className="text-center flex-1">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Số câu đúng</p>
                  <p className="text-xl font-bold text-green-600">{result.correctCount}</p>
                </div>
                <div className="w-px bg-slate-200" />
                <div className="text-center flex-1">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Điểm số</p>
                  <p className="text-xl font-bold text-blue-600">{result.score}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-80 md:max-h-none overflow-y-auto md:overflow-visible p-1">
                {result.results.map((res, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border flex flex-col items-center transition-all ${res.isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <span className="text-xs font-bold text-slate-400 mb-1">Câu {res.questionNumber}</span>
                    <div className="flex items-center gap-1">
                      <span className={`font-bold ${res.isCorrect ? 'text-green-700' : 'text-red-700'}`}>{res.studentAnswer}</span>
                      {res.isCorrect ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} className="text-red-600" />}
                    </div>
                    {!res.isCorrect && <span className="text-[10px] text-red-400 font-medium">Đáp án: {res.correctAnswer}</span>}
                  </div>
                ))}
              </div>

              {result.feedback && (
                <div className="mt-6 p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-xl">
                  <p className="text-sm font-semibold text-blue-800 mb-1">Nhận xét AI:</p>
                  <p className="text-sm text-blue-700 italic">"{result.feedback}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraderView;
