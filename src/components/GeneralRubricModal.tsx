import React from 'react';
import { X, Award } from 'lucide-react';

interface GeneralRubricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeneralRubricModal: React.FC<GeneralRubricModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const generalRubrics = [
    {
      title: '1. 주장의 타당성 및 논증력',
      category: '논지 형성',
      A: '논제에 대한 입장이 명확하며 타당한 근거 및 교과 개념·사례를 유기적으로 연계함.',
      B: '입장은 분명하나 근거가 단편적임.',
      C: '주장이 모호하거나 논리적 비약이 나타남.'
    },
    {
      title: '2. 반론 및 교차 조사',
      category: '상호작용',
      A: '상대 주장의 맹점을 정확히 짚어 구체적 반증 및 설득력 있는 재반론 수행.',
      B: '질문을 던지나 재반론이 원론적 수준에 머무름.',
      C: '상대 논점을 오해하거나 적절히 답변하지 못함.'
    },
    {
      title: '3. 자료 활용 및 정보 분석',
      category: '증거 제시',
      A: '통계, 법률 조항, 사상가 이론 등 신뢰성 있는 자료를 적절히 인용함.',
      B: '자료를 제시했으나 해석 및 연결이 다소 부족함.',
      C: '자료 제시가 없거나 부적절한 자료 인용.'
    },
    {
      title: '4. 토론 태도 및 의사소통',
      category: '토론 윤리',
      A: '발언 시간 엄수, 경청 및 민주적 태도 준수.',
      B: '규칙을 대체로 준수하나 시간 배분이 다소 미숙함.',
      C: '상대 발언을 끊거나 규칙 반복 위반.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">통합사회 공통 토론 루브릭 (4대 영역)</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          <p className="text-slate-300 text-xs bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            Debate Mate는 학생의 실제 발화를 바탕으로 아래 4가지 공통 영역과 단원별 과업 특수 루브릭을 다차원 채점합니다.
          </p>

          <div className="space-y-4">
            {generalRubrics.map((item, idx) => (
              <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-teal-300 text-sm sm:text-base">{item.title}</h3>
                  <span className="text-[11px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-semibold">
                    {item.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="bg-slate-900/80 border border-emerald-500/30 p-2.5 rounded-lg space-y-1">
                    <span className="inline-block px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold rounded text-[11px]">
                      상 (A)
                    </span>
                    <p className="text-slate-300">{item.A}</p>
                  </div>
                  <div className="bg-slate-900/80 border border-sky-500/30 p-2.5 rounded-lg space-y-1">
                    <span className="inline-block px-1.5 py-0.5 bg-sky-500/20 text-sky-400 font-bold rounded text-[11px]">
                      중 (B)
                    </span>
                    <p className="text-slate-300">{item.B}</p>
                  </div>
                  <div className="bg-slate-900/80 border border-rose-500/30 p-2.5 rounded-lg space-y-1">
                    <span className="inline-block px-1.5 py-0.5 bg-rose-500/20 text-rose-400 font-bold rounded text-[11px]">
                      하 (C)
                    </span>
                    <p className="text-slate-300">{item.C}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
