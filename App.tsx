
import React, { useState, useCallback, useEffect } from 'react';
import { AppMode } from './types';
import GraderView from './components/GraderView';
import EditorView from './components/EditorView';
import GeneratorView from './components/GeneratorView';
import { Layout, CheckSquare, Edit3, Image as ImageIcon, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.GRADER);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  useEffect(() => {
    // Check for API key selection state (mocking the window.aistudio helper)
    const checkKey = async () => {
      // In a real environment, window.aistudio would be provided
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        // Fallback for development if not in AI Studio
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (typeof (window as any).aistudio?.openSelectKey === 'function') {
      await (window as any).aistudio.openSelectKey();
      // Per instructions: assume success and proceed
      setHasApiKey(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar / Navigation */}
      <nav className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Layout size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">SmartGrader AI</h1>
        </div>

        <button
          onClick={() => setActiveMode(AppMode.GRADER)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeMode === AppMode.GRADER ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckSquare size={20} />
          <span>Chấm bài</span>
        </button>

        <button
          onClick={() => setActiveMode(AppMode.EDITOR)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeMode === AppMode.EDITOR ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Edit3 size={20} />
          <span>Chỉnh sửa ảnh AI</span>
        </button>

        <button
          onClick={() => setActiveMode(AppMode.GENERATOR)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeMode === AppMode.GENERATOR ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ImageIcon size={20} />
          <span>Tạo ảnh 4K</span>
        </button>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <button
            onClick={handleOpenKeySelector}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all text-sm"
          >
            <Settings size={18} />
            <span>Cấu hình API Key</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {activeMode === AppMode.GRADER && <GraderView />}
          {activeMode === AppMode.EDITOR && <EditorView />}
          {activeMode === AppMode.GENERATOR && <GeneratorView />}
        </div>
      </main>
    </div>
  );
};

export default App;
