import React, { useState } from 'react';
import { BookOpen, Sparkles, MessageSquare, Mic, Award, Hash } from 'lucide-react';
import type { Topic } from '../types';
import rubricsData from '../data/rubrics.json';

interface TopicSelectorProps {
  onSelectModeA: (topic: Topic) => void;
  onSelectModeB: (topic: Topic) => void;
  onOpenGeneralRubric: () => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  onSelectModeA,
  onSelectModeB,
  onOpenGeneralRubric
}) => {
  const topics: Topic[] = rubricsData.topics as Topic[];
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [expandedRubricId, setExpandedRubricId] = useState<string | null>(null);

  const units = ['all', ...Array.from(new Set(topics.map(t => t.unit)))];

  const filteredTopics = selectedUnit === 'all' 
    ? topics 
    : topics.filter(t => t.unit === selectedUnit);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950/80 to-slate-900 border border-teal-500/20 p-6 sm:p-8 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full text-xs font-semibold text-teal-300">
            <Sparkles className="w-3.5 h-3.5" /> 2026학년도 2학기 고등학교 통합사회
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
            Debate Mate 토론 논제 및 실증 평가
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            OREO 스캐폴딩 구조화 가이드와 AI 반론 코치를 통한 **1:1 연습(모드 A)** 및 녹음 기반 오디오 분석으로 교과 성취도를 자동 채점하는 **실전 평가(모드 B)**를 선택하세요.
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={onOpenGeneralRubric}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 transition-colors shadow-sm"
            >
              <Award className="w-4 h-4 text-amber-400" />
              공통 루브릭 4대 영역 보기
            </button>
          </div>
        </div>
      </div>

      {/* Unit Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" /> 단원 필터:
        </span>
        {units.map(unit => (
          <button
            key={unit}
            onClick={() => setSelectedUnit(unit)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              selectedUnit === unit
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20 font-bold'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {unit === 'all' ? '전체 논제 (9개)' : unit}
          </button>
        ))}
      </div>

      {/* Topics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map((topic) => {
          const isRubricExpanded = expandedRubricId === topic.id;

          return (
            <div
              key={topic.id}
              className="group bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-teal-950/20 space-y-4"
            >
              <div className="space-y-3">
                {/* Topic Header & Unit */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-teal-300 font-semibold text-[11px] rounded-lg">
                    {topic.unit}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{topic.id}</span>
                </div>

                {/* Topic Title */}
                <h3 className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-teal-200 transition-colors leading-snug">
                  {topic.title}
                </h3>

                {/* Smart Concept Keywords */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {topic.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-950/60 border border-teal-800/60 text-teal-300 text-[11px] rounded-md font-medium"
                    >
                      <Hash className="w-3 h-3 text-teal-400" />
                      {kw}
                    </span>
                  ))}
                </div>

                {/* Task Specific Rubric Toggle */}
                <div className="pt-2">
                  <button
                    onClick={() => setExpandedRubricId(isRubricExpanded ? null : topic.id)}
                    className="text-[11px] text-slate-400 hover:text-teal-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    {isRubricExpanded ? '과업 특수 루브릭 접기' : '과업 특수 루브릭 (A/B/C) 보기'}
                  </button>

                  {isRubricExpanded && (
                    <div className="mt-2.5 p-3 bg-slate-850 border border-slate-700/80 rounded-xl space-y-2 text-xs text-slate-300 animate-fade-in">
                      <div className="font-semibold text-amber-300 text-[11px]">과업 특수 성취기준</div>
                      <div className="space-y-1.5">
                        <div><strong className="text-emerald-400">[상 A]</strong> {topic.task_rubric.A}</div>
                        <div><strong className="text-sky-400">[중 B]</strong> {topic.task_rubric.B}</div>
                        <div><strong className="text-rose-400">[하 C]</strong> {topic.task_rubric.C}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mode Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onSelectModeA(topic)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-teal-900/40 border border-slate-700 hover:border-teal-500/50 rounded-xl text-xs font-bold text-teal-300 transition-all group/btn"
                >
                  <MessageSquare className="w-4 h-4 text-teal-400 group-hover/btn:scale-110 transition-transform" />
                  <span>모드 A: 1:1 훈련</span>
                </button>

                <button
                  onClick={() => onSelectModeB(topic)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 rounded-xl text-xs font-bold text-white shadow-md shadow-teal-500/20 transition-all group/btn"
                >
                  <Mic className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  <span>모드 B: 실전 녹음</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
