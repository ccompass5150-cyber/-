import React from 'react';
import { SurveyData, QuestionType } from '../types';

interface SurveyPreviewProps {
  data: SurveyData;
}

const SurveyPreview: React.FC<SurveyPreviewProps> = ({ data }) => {
  return (
    <div className="w-full bg-slate-50 min-h-screen p-4 md:p-8 font-sans text-slate-800">
      {/* Header Summary */}
      <div className="mb-6 text-sm md:text-base">
        <span>共 </span>
        <span className="text-purple-600 font-bold text-lg mx-1">{data.totalCount.toLocaleString()}</span>
        <span> 份答卷符合搜索要求</span>
      </div>

      <div className="space-y-6">
        {data.questions.map((question, index) => (
          <div 
            key={question.id} 
            className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
          >
            {/* Question Header */}
            <div className="p-5 border-b border-slate-100 flex items-start gap-3">
              <span className="font-bold text-slate-900 mt-0.5">Q{index + 1}</span>
              
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 mt-0.5 whitespace-nowrap">
                {question.type === QuestionType.SINGLE ? '单选' : '多选'}
              </span>
              
              <h3 className="font-bold text-slate-900 text-base md:text-lg leading-snug">
                {question.text}
              </h3>
            </div>

            {/* Options Table-like layout */}
            <div className="p-5 pt-2">
              {/* Header Row */}
              <div className="flex justify-between items-center text-xs text-slate-400 mb-4 px-1">
                <span>选项</span>
                <span className="w-1/2 md:w-2/3 pl-4">百分比</span>
              </div>

              {/* Options Rows */}
              <div className="space-y-6">
                {question.options.map((option) => (
                  <div key={option.id} className="group">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                      
                      {/* Left: Option Label */}
                      <div className="md:flex-1 text-sm text-slate-700 font-medium break-words pr-2">
                        {option.label}
                      </div>

                      {/* Right: Bar Chart Area */}
                      <div className="w-full md:w-2/3 flex items-center gap-3">
                        {/* Progress Bar Container */}
                        <div className="flex-1 h-3 bg-purple-50 rounded-full overflow-hidden relative">
                          {/* Actual Bar */}
                          <div 
                            className="h-full bg-purple-500 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${Math.min(option.percentage, 100)}%` }}
                          />
                        </div>
                        
                        {/* Percentage Text */}
                        <div className="w-12 text-right text-sm font-medium text-slate-600">
                          {option.percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurveyPreview;
