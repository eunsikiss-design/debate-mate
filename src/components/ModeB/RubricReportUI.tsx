import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, AlertCircle, Table, RefreshCw, User, Volume2, ArrowLeft } from 'lucide-react';
import type { Topic, RubricResult, SavedEvaluationRecord, SideEvaluation } from '../../types';
import { StorageService } from '../../services/storageService';

interface RubricReportUIProps {
  topic: Topic;
  result: RubricResult;
  audioUrl?: string | null;
  onReset: () => void;
  onBack: () => void;
}

export const RubricReportUI: React.FC<RubricReportUIProps> = ({
  topic,
  result,
  audioUrl,
  onReset,
  onBack
}) => {
  const [settings] = useState(StorageService.getSettings());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedToast, setSubmittedToast] = useState(false);

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const getGradeBadge = (grade: 'A' | 'B' | 'C') => {
    if (grade === 'A') {
      return (
        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg font-extrabold text-xs">
          상 (A)
        </span>
      );
    }
    if (grade === 'B') {
      return (
        <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded-lg font-extrabold text-xs">
          중 (B)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg font-extrabold text-xs">
        하 (C)
      </span>
    );
  };

  const handleSaveAndSubmit = async () => {
    setIsSubmitting(true);

    const affGradeSummary = `찬성:${result.affirmative.task_grade} (타당성${result.affirmative.grades.argumentation}/반론${result.affirmative.grades.rebuttal}/자료${result.affirmative.grades.evidence}/태도${result.affirmative.grades.attitude})`;
    const negGradeSummary = `반대:${result.negative.task_grade} (타당성${result.negative.grades.argumentation}/반론${result.negative.grades.rebuttal}/자료${result.negative.grades.evidence}/태도${result.negative.grades.attitude})`;

    const newRecord: SavedEvaluationRecord = {
      id: `rec_${Date.now()}`,
      timestamp: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      studentIdName: settings.studentIdName || '10101 홍길동',
      teamName: settings.teamName || '1모둠',
      topicId: topic.id,
      topicTitle: topic.title,
      affSummaryGrade: affGradeSummary,
      negSummaryGrade: negGradeSummary,
      detailFeedbackSummary: result.summary,
      audioUrl: audioUrl || 'https://storage...',
      rawRubricResult: result
    };

    StorageService.saveRecord(newRecord);
    setIsSubmitting(false);
    setSubmittedToast(true);
    setTimeout(() => setSubmittedToast(false), 4000);
  };

  const renderSideCard = (sideTitle: string, data: SideEvaluation, isAffirmative: boolean) => (
    <div className={`bg-slate-900 border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl ${
      isAffirmative ? 'border-teal-500/40' : 'border-sky-500/40'
    }`}>
      {/* Side Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isAffirmative ? 'bg-teal-400' : 'bg-sky-400'}`} />
          <h3 className="font-extrabold text-base sm:text-lg text-white">{sideTitle}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">과업 특수 등급:</span>
          {getGradeBadge(data.task_grade)}
        </div>
      </div>

      {/* 4 General Rubrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-300">주장 타당성</span>
          {getGradeBadge(data.grades.argumentation)}
        </div>
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-300">반론/교차조사</span>
          {getGradeBadge(data.grades.rebuttal)}
        </div>
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-300">자료 활용</span>
          {getGradeBadge(data.grades.evidence)}
        </div>
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-300">토론 태도</span>
          {getGradeBadge(data.grades.attitude)}
        </div>
      </div>

      {/* Strengths */}
      <div className="space-y-1.5 text-xs">
        <div className="font-bold text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" /> 잘한 점 (발화 직접 인용):
        </div>
        <ul className="space-y-1 bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-xl text-slate-200">
          {data.strengths.map((str, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span>{str}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div className="space-y-1.5 text-xs">
        <div className="font-bold text-amber-400 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> 보완할 점 및 추천 논거:
        </div>
        <ul className="space-y-1 bg-amber-950/20 border border-amber-800/40 p-3 rounded-xl text-slate-200">
          {data.improvements.map((imp, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold">•</span>
              <span>{imp}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Concept Usage */}
      <div className="bg-slate-850 p-3 rounded-xl border border-slate-700/80 text-xs space-y-1">
        <span className="font-semibold text-teal-300 block">교과 핵심 개념 활용 피드백</span>
        <p className="text-slate-300 leading-relaxed">{data.concept_usage}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md">
              실전 채점 리포트
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
              {topic.title}
            </h2>
          </div>
        </div>

        <button
          onClick={onReset}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> 다시 녹음하기
        </button>
      </div>

      {/* Overall Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/60 to-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-400" />
          <h3 className="text-lg font-extrabold text-white">토론 전반 종합 성취 평가</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          {result.summary}
        </p>

        {audioUrl && (
          <div className="flex items-center gap-2 pt-1">
            <Volume2 className="w-4 h-4 text-teal-400" />
            <audio controls src={audioUrl} className="w-full h-9 rounded-lg" />
          </div>
        )}
      </div>

      {/* Two Teams Cards (Affirmative vs Negative) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSideCard('찬성 측 (Affirmative)', result.affirmative, true)}
        {renderSideCard('반대 측 (Negative)', result.negative, false)}
      </div>

      {/* Submit / Export Action Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <User className="w-4 h-4 text-teal-400" />
          <span>제출 정보: <strong className="text-white">{settings.studentIdName}</strong> ({settings.teamName})</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {submittedToast && (
            <span className="text-xs text-emerald-400 font-bold animate-bounce flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> 제출이 완료되었습니다!
            </span>
          )}

          <button
            onClick={handleSaveAndSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Table className="w-4 h-4" />
            )}
            <span>교사용 데이터 제출 (구글 시트/로컬 저장)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
