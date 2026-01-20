import React, { useState } from 'react';
import { PanelLeftOpen } from 'lucide-react';
import SurveyEditor from './components/SurveyEditor';
import SurveyPreview from './components/SurveyPreview';
import { SurveyData, QuestionType } from './types';

// Initial sample data matches the style of the user's request
const INITIAL_DATA: SurveyData = {
  totalCount: 3996,
  questions: [
    {
      id: 'q1',
      text: '若您的理赔案件涉及多方责任，我司对责任划分的清晰度、赔付比例的核算准确性及沟通说明的充分性如何？',
      type: QuestionType.SINGLE,
      options: [
        { id: 'o1-1', label: '责任划分逻辑清晰，赔付比例核算精准，详细说明划分依据与核算方式，完全认可', percentage: 87 },
        { id: 'o1-2', label: '责任划分基本合理，赔付比例核算无明显偏差，但沟通说明较为简略，存在少量疑问', percentage: 11 },
        { id: 'o1-3', label: '责任划分模糊，赔付比例核算缺乏依据，沟通时回避核心问题，易产生纠纷', percentage: 2 },
      ]
    },
    {
      id: 'q2',
      text: '您在理赔过程中与我司工作人员沟通时（含电话、线上渠道），对方的语言表达规范性、耐心倾听及换位思考意识如何？',
      type: QuestionType.SINGLE,
      options: [
        { id: 'o2-1', label: '表达清晰规范，耐心倾听诉求，能站在您的角度回应问题，沟通舒适', percentage: 97.2 },
        { id: 'o2-2', label: '表达基本通顺，但倾听不够耐心，多按标准话术回应，缺乏共情', percentage: 2.8 },
        { id: 'o2-3', label: '表达混乱无逻辑，打断诉求或敷衍回应，态度强硬，沟通体验极差', percentage: 0 },
      ]
    },
    {
      id: 'q3',
      text: '当您的车辆在偏远地区（如乡镇、山区）出险，我司勘察人员的到达时效及现场处理的专业度如何？',
      type: QuestionType.SINGLE,
      options: [
        { id: 'o3-1', label: '按承诺时效快速到达，现场勘察细致，高效完成证据采集与初步定责', percentage: 96.4 },
        { id: 'o3-2', label: '到达时效延迟1-2小时，现场处理流程简略，部分细节未核实', percentage: 2.7 },
        { id: 'o3-3', label: '长期拖延无法到达，或要求自行拍摄证据，现场处理完全不到位', percentage: 0.9 },
      ]
    }
  ]
};

const App: React.FC = () => {
  const [surveyData, setSurveyData] = useState<SurveyData>(INITIAL_DATA);
  const [isEditorOpen, setIsEditorOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      {/* Mobile Header / Toggle */}
      <div className="md:hidden bg-white p-3 border-b flex justify-between items-center z-30 shadow-sm shrink-0">
        <h1 className="font-bold text-purple-700">SurveyViz</h1>
        <button 
          onClick={() => setIsEditorOpen(!isEditorOpen)}
          className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors"
        >
          {isEditorOpen ? '查看预览' : '编辑数据'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel: Editor */}
        <div 
          className={`
            h-full bg-white border-r border-slate-200 z-20 
            transition-all duration-500 ease-in-out
            absolute md:relative overflow-hidden
            ${isEditorOpen 
              ? 'w-full md:w-[420px] lg:w-[480px] translate-x-0 opacity-100' 
              : 'w-0 -translate-x-10 md:translate-x-0 md:w-0 opacity-0 pointer-events-none'
            }
          `}
        >
          <div className="w-full md:w-[420px] lg:w-[480px] h-full flex flex-col">
            <SurveyEditor 
              data={surveyData} 
              onChange={setSurveyData} 
              onClose={() => setIsEditorOpen(false)} 
            />
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="flex-1 relative bg-slate-50 w-full h-full overflow-hidden flex flex-col">
          {/* Floating Expand Button (Desktop Only) */}
          {/* Moved to bottom-left to avoid blocking the header text */}
          <button
            onClick={() => setIsEditorOpen(true)}
            className={`
              absolute bottom-6 left-6 z-10 
              hidden md:flex items-center justify-center p-3
              bg-white text-slate-500 rounded-full shadow-lg border border-slate-100 
              hover:text-purple-600 hover:scale-110 transition-all duration-300
              ${isEditorOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}
            `}
            title="展开数据编辑器"
          >
            <PanelLeftOpen size={24} />
          </button>

          <div className="flex-1 overflow-y-auto w-full">
            <SurveyPreview data={surveyData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;