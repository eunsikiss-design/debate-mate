import React from 'react';
import { Tag, Sparkles, Check } from 'lucide-react';

interface ConceptHighlighterProps {
  keywords: string[];
  detectedKeywords: string[];
}

export const ConceptHighlighter: React.FC<ConceptHighlighterProps> = ({
  keywords,
  detectedKeywords
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
          <Tag className="w-3.5 h-3.5 text-teal-400" />
          <span>스마트 개념 치트키 태그 (Smart Concept Highlighter)</span>
        </div>
        <span className="text-[11px] text-slate-400">
          발화 시 자동 점등 ({detectedKeywords.length}/{keywords.length})
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {keywords.map((kw, i) => {
          const isLit = detectedKeywords.includes(kw);

          return (
            <div
              key={i}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                isLit
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/30 scale-105 border border-teal-300/50 ring-2 ring-teal-400/40 animate-pulse'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700/80 hover:border-slate-600'
              }`}
            >
              {isLit ? (
                <Check className="w-3.5 h-3.5 text-white font-bold" />
              ) : (
                <Sparkles className="w-3 h-3 text-slate-500" />
              )}
              <span>{kw}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
