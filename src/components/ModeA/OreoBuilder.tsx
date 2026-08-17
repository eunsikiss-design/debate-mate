import React, { useState } from 'react';
import type { Topic, OreoData } from '../../types';
import { Sparkles, FileText, CheckCircle2, ChevronDown, Lightbulb } from 'lucide-react';

interface OreoBuilderProps {
  topic: Topic;
  onComplete: (data: OreoData) => void;
  savedOreo: OreoData | null;
}

export const OreoBuilder: React.FC<OreoBuilderProps> = ({
  topic,
  onComplete,
  savedOreo
}) => {
  const [oreo, setOreo] = useState<OreoData>(
    savedOreo || {
      opinion: '',
      reason: '',
      example: '',
      opinion2: ''
    }
  );
  const [isCollapsed, setIsCollapsed] = useState<boolean>(savedOreo !== null);

  const isFormValid = oreo.opinion.trim() && oreo.reason.trim();

  const handleSave = () => {
    if (!isFormValid) return;
    onComplete(oreo);
    setIsCollapsed(true);
  };

  const handleAutoFillSample = () => {
    const k1 = topic.keywords[0] || '교과서 핵심 개념';
    const k2 = topic.keywords[1] || '관련 사례';

    setOreo({
      opinion: `저는 '${topic.title}'에 대해 찬성(또는 반대)합니다.`,
      reason: `왜냐하면 통합사회 교과에서 배운 '${k1}' 관점에서 볼 때 정당성과 효용성이 크기 때문입니다.`,
      example: `실제로 ${k2} 및 관련 사상가/통계 자료에 의하면 이러한 방향이 사회적 합의에 부합함을 알 수 있습니다.`,
      opinion2: `따라서 기본권과 공공선이 유기적으로 조화를 이루도록 해당 방안을 추진(또는 보완)해야 합니다.`
    });
  };

  if (isCollapsed && savedOreo) {
    return (
      <div className="bg-slate-900/90 border border-teal-500/40 rounded-2xl p-4 shadow-lg text-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
            <FileText className="w-4 h-4 text-teal-400" />
            <span>나의 OREO 큐카드 (컨닝 페이퍼)</span>
            <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] rounded-md font-semibold">
              작성 완료
            </span>
          </div>
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-xs text-slate-400 hover:text-teal-300 flex items-center gap-1 font-semibold"
          >
            수정하기 <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <strong className="text-teal-400 block font-semibold mb-0.5">O (주장)</strong>
            <p className="text-slate-300 truncate">{savedOreo.opinion}</p>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <strong className="text-sky-400 block font-semibold mb-0.5">R (이유)</strong>
            <p className="text-slate-300 truncate">{savedOreo.reason}</p>
          </div>
          {savedOreo.example && (
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <strong className="text-amber-400 block font-semibold mb-0.5">E (근거/사례)</strong>
              <p className="text-slate-300 truncate">{savedOreo.example}</p>
            </div>
          )}
          {savedOreo.opinion2 && (
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <strong className="text-emerald-400 block font-semibold mb-0.5">O (강조)</strong>
              <p className="text-slate-300 truncate">{savedOreo.opinion2}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            OREO 논증 빌더 (Scaffolding)
          </h3>
          <p className="text-xs text-slate-400">
            발화 전 4단계 구조로 입론 개요를 정리하세요. 완성 후 상단 큐카드로 고정됩니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAutoFillSample}
          className="px-2.5 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 text-xs rounded-lg font-semibold flex items-center gap-1 transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5" /> 예시 채우기
        </button>
      </div>

      <div className="space-y-3 text-xs sm:text-sm">
        {/* O: Opinion */}
        <div className="space-y-1">
          <label className="font-semibold text-teal-300 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
              O
            </span>
            주장 (Opinion) <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="예: 촉법소년 연령을 13세로 하향 조정해야 합니다."
            value={oreo.opinion}
            onChange={e => setOreo({ ...oreo, opinion: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* R: Reason */}
        <div className="space-y-1">
          <label className="font-semibold text-sky-300 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs">
              R
            </span>
            이유 (Reason) <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="예: 강력 범죄의 연령대가 낮아지고 피해자 인권 보호 및 응보적 정의가 필요하기 때문입니다."
            value={oreo.reason}
            onChange={e => setOreo({ ...oreo, reason: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* E: Example */}
        <div className="space-y-1">
          <label className="font-semibold text-amber-300 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
              E
            </span>
            근거 / 사례 (Example)
          </label>
          <textarea
            rows={2}
            placeholder="예: 경찰청 소년범죄 통계에 의하면 13세 소년 범죄율이 과거 대비 크게 증가하였습니다."
            value={oreo.example}
            onChange={e => setOreo({ ...oreo, example: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* O: Opinion Restatement */}
        <div className="space-y-1">
          <label className="font-semibold text-emerald-300 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
              O
            </span>
            강조 및 마무리 (Restatement)
          </label>
          <input
            type="text"
            placeholder="예: 따라서 소년법 개정을 통해 사회적 안녕과 법치를 확립해야 합니다."
            value={oreo.opinion2}
            onChange={e => setOreo({ ...oreo, opinion2: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={!isFormValid}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
            isFormValid
              ? 'bg-gradient-to-r from-teal-500 to-sky-500 text-white shadow-teal-500/20 hover:opacity-90'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> 큐카드 작성 완료 및 고정
        </button>
      </div>
    </div>
  );
};
