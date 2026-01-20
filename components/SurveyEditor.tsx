import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Wand2, Loader2, Save, PanelLeftClose } from 'lucide-react';
import { SurveyData, Question, QuestionType, Option } from '../types';
import { parseSurveyText } from '../services/geminiService';

interface SurveyEditorProps {
  data: SurveyData;
  onChange: (data: SurveyData) => void;
  onClose?: () => void;
}

const SurveyEditor: React.FC<SurveyEditorProps> = ({ data, onChange, onClose }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Manual Editing Handlers ---

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, totalCount: Number(e.target.value) || 0 });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '新问题',
      type: QuestionType.SINGLE,
      options: [
        { id: Date.now().toString() + '1', label: '选项 A', percentage: 50 },
        { id: Date.now().toString() + '2', label: '选项 B', percentage: 50 },
      ]
    };
    onChange({ ...data, questions: [...data.questions, newQuestion] });
  };

  const removeQuestion = (qId: string) => {
    onChange({ ...data, questions: data.questions.filter(q => q.id !== qId) });
  };

  const updateQuestion = (qId: string, updates: Partial<Question>) => {
    onChange({
      ...data,
      questions: data.questions.map(q => q.id === qId ? { ...q, ...updates } : q)
    });
  };

  const addOption = (qId: string) => {
    const questions = data.questions.map(q => {
      if (q.id !== qId) return q;
      return {
        ...q,
        options: [...q.options, { id: Date.now().toString(), label: '新选项', percentage: 0 }]
      };
    });
    onChange({ ...data, questions });
  };

  const removeOption = (qId: string, oId: string) => {
    const questions = data.questions.map(q => {
      if (q.id !== qId) return q;
      return {
        ...q,
        options: q.options.filter(o => o.id !== oId)
      };
    });
    onChange({ ...data, questions });
  };

  const updateOption = (qId: string, oId: string, updates: Partial<Option>) => {
    const questions = data.questions.map(q => {
      if (q.id !== qId) return q;
      return {
        ...q,
        options: q.options.map(o => o.id === oId ? { ...o, ...updates } : o)
      };
    });
    onChange({ ...data, questions });
  };

  // --- AI Handling ---

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const newData = await parseSurveyText(aiPrompt);
      if (newData) {
        onChange(newData);
        setActiveTab('manual'); // Switch back to see result
      } else {
        setError('Could not parse valid survey data. Please try providing more details.');
      }
    } catch (err) {
      setError('An error occurred while communicating with the AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white h-full flex flex-col border-r border-slate-200">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <h2 className="font-bold text-slate-700">数据编辑器</h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'manual' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              手动编辑
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                activeTab === 'ai' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Wand2 size={14} /> AI 生成
            </button>
          </div>
          
          {/* Close Button for Desktop */}
          {onClose && (
            <button 
              onClick={onClose}
              className="hidden md:flex items-center justify-center p-2 text-slate-400 hover:text-purple-600 hover:bg-slate-200 rounded-lg transition-colors"
              title="收起侧边栏"
            >
              <PanelLeftClose size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'manual' ? (
          <div className="p-4 space-y-6">
            {/* Global Settings */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <label className="block text-sm font-medium text-slate-600 mb-1">
                问卷总数 (Total Count)
              </label>
              <input
                type="number"
                value={data.totalCount}
                onChange={handleTotalChange}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium"
              />
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {data.questions.map((q, idx) => (
                <div key={q.id} className="border border-slate-200 rounded-lg p-4 relative group hover:border-purple-300 transition-colors bg-white shadow-sm">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={() => removeQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="删除问题"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mb-4 pr-8">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                      问题 Q{idx + 1}
                    </label>
                    <textarea
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none shadow-sm"
                      rows={2}
                      placeholder="输入问题内容..."
                    />
                    <div className="mt-2">
                        <select
                        value={q.type}
                        onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                        className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-slate-600 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                        <option value={QuestionType.SINGLE}>单选 (Single Choice)</option>
                        <option value={QuestionType.MULTI}>多选 (Multi Choice)</option>
                        </select>
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2 pl-3 border-l-2 border-slate-100">
                    {q.options.map((o) => (
                      <div key={o.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={o.label}
                          onChange={(e) => updateOption(q.id, o.id, { label: e.target.value })}
                          className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all placeholder-slate-400 text-slate-900"
                          placeholder="选项描述"
                        />
                        <div className="flex items-center gap-1 w-20 relative">
                          <input
                            type="number"
                            value={o.percentage}
                            onChange={(e) => updateOption(q.id, o.id, { percentage: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-right pr-5 text-slate-900"
                          />
                          <span className="absolute right-2 text-xs text-slate-400 pointer-events-none">%</span>
                        </div>
                        <button 
                          onClick={() => removeOption(q.id, o.id)}
                          className="text-slate-300 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(q.id)}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 mt-3 px-1"
                    >
                      <Plus size={12} /> 添加选项
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addQuestion}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={18} /> 添加新问题
            </button>
          </div>
        ) : (
          <div className="p-4 h-full flex flex-col">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4 text-sm text-purple-900">
              <p className="font-semibold mb-1">AI 智能导入</p>
              <p>粘贴您的调查数据文本，我们将自动为您生成图表。包含问题、选项和百分比即可。</p>
            </div>
            
            <textarea
              className="flex-1 w-full bg-slate-50 border border-slate-300 rounded-lg p-4 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none resize-none font-mono text-sm transition-colors text-slate-900"
              placeholder={`例如：
共 2500 份问卷
Q1 单选 您对我们的服务满意吗？
非常满意 60%
一般 30%
不满意 10%

Q2 多选 您喜欢的颜色？
红色 45%
蓝色 55%`}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            
            {error && (
              <div className="mt-2 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handleAiGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="mt-4 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all shadow-sm active:scale-[0.99]"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
              {isGenerating ? '正在生成...' : '生成图表'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyEditor;