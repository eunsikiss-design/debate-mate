import React, { useState, useEffect } from 'react';
import type { SavedEvaluationRecord, DebateFlowStep } from '../../types';
import { StorageService } from '../../services/storageService';
import { FolderKanban, FileText, Table, GitCommit, Award, Volume2, Copy, Download, CheckCircle2 } from 'lucide-react';

interface ArchiveMainProps {
  highlightRecordId?: string | null;
}

export const ArchiveMain: React.FC<ArchiveMainProps> = ({ highlightRecordId }) => {
  const [records, setRecords] = useState<SavedEvaluationRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<SavedEvaluationRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'transcript' | 'outline' | 'flow' | 'verdict'>('verdict');
  const [copyToast, setCopyToast] = useState(false);

  useEffect(() => {
    const loaded = StorageService.getRecords();
    setRecords(loaded);
    if (highlightRecordId) {
      const match = loaded.find(r => r.id === highlightRecordId);
      if (match) setSelectedRecord(match);
      else if (loaded.length > 0) setSelectedRecord(loaded[0]);
    } else if (loaded.length > 0) {
      setSelectedRecord(loaded[0]);
    }
  }, [highlightRecordId]);

  const handleCopyRow = (rec: SavedEvaluationRecord) => {
    const row = `${rec.timestamp}\t${rec.studentIdName}\t${rec.teamName}\t${rec.topicId}\t${rec.affSummaryGrade}\t${rec.negSummaryGrade}\t${rec.detailFeedbackSummary}\t${rec.audioUrl}`;
    navigator.clipboard.writeText(row);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  const sampleFlowSteps: DebateFlowStep[] = [
    { stepIndex: 1, speaker: '찬성 1 (사용자)', phase: '입론', summary: '소년범죄 처벌 강화 및 응보적 정의 실현 강조', keyPoint: '응보주의' },
    { stepIndex: 2, speaker: '반대 1 (AI)', phase: '교차조사', summary: '소년의 교화 가능성 및 낙인 효과 우려 질문', keyPoint: '낙인 효과', counteredStepIndex: 1 },
    { stepIndex: 3, speaker: '찬성 1 (사용자)', phase: '반론', summary: '피해자 인권 구제 및 재발 방지 통계 제시', keyPoint: '피해자 권리 구제', counteredStepIndex: 2 },
    { stepIndex: 4, speaker: '반대 1 (AI)', phase: '최종발언', summary: '교정 시설 확충 및 사회 복귀 기회 균형 주장', keyPoint: '교화 및 사회 복귀', counteredStepIndex: 3 }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-2xl">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-md">
              4. 기록실 (Debate Archive)
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
              토론 전사본 · 개요표 · 토론 흐름 · 판정 결과 통합 보관소
            </h2>
          </div>
        </div>

        {selectedRecord && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyRow(selectedRecord)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> 1행 복사
            </button>
            <button
              onClick={() => StorageService.exportToCSV([selectedRecord])}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" /> CSV
            </button>
          </div>
        )}
      </div>

      {copyToast && (
        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-bounce">
          <CheckCircle2 className="w-4 h-4" /> 구글 스프레드시트용 탭 복사 완료!
        </span>
      )}

      {records.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-2">
          <FolderKanban className="w-10 h-10 mx-auto text-slate-600" />
          <p>저장된 토론 기록이 없습니다. [3. AI와 토론하기]에서 토론을 완료하고 판정을 받아보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Record Selector Sidebar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2 max-h-[500px] overflow-y-auto">
            <span className="text-xs font-bold text-slate-400 block px-2 mb-1">토론 기록 목록 ({records.length}건)</span>
            {records.map(rec => (
              <div
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                  selectedRecord?.id === rec.id
                    ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-md'
                    : 'bg-slate-850 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="text-[10px] text-amber-400 font-mono">{rec.timestamp}</div>
                <div className="text-xs font-bold text-slate-200 truncate">{rec.topicTitle}</div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{rec.studentIdName}</span>
                  <span className="text-teal-400 font-semibold">{rec.affSummaryGrade.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Record Viewer Workspace */}
          {selectedRecord && (
            <div className="lg:col-span-3 space-y-4">
              {/* Record Title Banner */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                <span className="text-[11px] text-amber-400 font-mono">[{selectedRecord.topicId}] {selectedRecord.timestamp}</span>
                <h3 className="font-extrabold text-base text-white">{selectedRecord.topicTitle}</h3>
              </div>

              {/* 4 Archive Sub-Tabs */}
              <div className="grid grid-cols-4 gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl text-xs font-bold text-slate-400">
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
                    activeTab === 'transcript' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> 1. 전사본
                </button>
                <button
                  onClick={() => setActiveTab('outline')}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
                    activeTab === 'outline' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'hover:bg-slate-800'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" /> 2. 개요표
                </button>
                <button
                  onClick={() => setActiveTab('flow')}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
                    activeTab === 'flow' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'hover:bg-slate-800'
                  }`}
                >
                  <GitCommit className="w-3.5 h-3.5" /> 3. 토론 흐름
                </button>
                <button
                  onClick={() => setActiveTab('verdict')}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
                    activeTab === 'verdict' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'hover:bg-slate-800'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" /> 4. 판정 결과
                </button>
              </div>

              {/* Sub-Tab 1: 전사본 (Transcript) */}
              {activeTab === 'transcript' && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                  <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> 발화 전체 전사본 (Full STT Transcript)
                  </h4>

                  {selectedRecord.audioUrl && (
                    <div className="bg-slate-850 p-3 rounded-2xl border border-slate-700/80 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <audio controls src={selectedRecord.audioUrl} className="w-full h-8" />
                    </div>
                  )}

                  <div className="space-y-3 max-h-[360px] overflow-y-auto p-1">
                    {(selectedRecord.chatHistory || []).map((msg, i) => (
                      <div key={i} className={`p-3 rounded-2xl text-xs ${msg.role === 'user' ? 'bg-teal-950/40 border border-teal-800/60 text-teal-100 ml-8' : 'bg-slate-800 border border-slate-700 text-slate-200 mr-8'}`}>
                        <div className="font-semibold text-[10px] text-slate-400 mb-1">{msg.role === 'user' ? '사용자' : 'AI 코치'} • {msg.timestamp}</div>
                        <p>{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: 개요표 (Outline) */}
              {activeTab === 'outline' && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 text-xs">
                  <h4 className="font-bold text-teal-300 text-sm flex items-center gap-1.5">
                    <Table className="w-4 h-4" /> 토론 입론 및 찬반 구조 개요표
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-teal-950/20 border border-teal-500/30 p-4 rounded-2xl space-y-2">
                      <strong className="text-teal-300 block font-bold text-sm">찬성 측 입론</strong>
                      <p className="text-slate-300 leading-relaxed">{selectedRecord.affSummaryGrade}</p>
                    </div>
                    <div className="bg-sky-950/20 border border-sky-500/30 p-4 rounded-2xl space-y-2">
                      <strong className="text-sky-300 block font-bold text-sm">반대 측 입론</strong>
                      <p className="text-slate-300 leading-relaxed">{selectedRecord.negSummaryGrade}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: 토론 흐름 (Debate Flow Map) */}
              {activeTab === 'flow' && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 text-xs">
                  <h4 className="font-bold text-sky-300 text-sm flex items-center gap-1.5">
                    <GitCommit className="w-4 h-4" /> 입론→교차조사→반론 연결 토론 흐름도 (Debate Flow Map)
                  </h4>

                  <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {(selectedRecord.debateFlow || sampleFlowSteps).map((step, idx) => (
                      <div key={idx} className="relative pl-9 space-y-1">
                        <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-sky-400 border-2 border-slate-900" />
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] font-bold rounded-md">{step.phase}</span>
                          <strong className="text-white text-xs">{step.speaker}</strong>
                          <span className="text-slate-500 text-[10px]">#{step.stepIndex}</span>
                        </div>
                        <p className="text-slate-300 bg-slate-850 p-2.5 rounded-xl border border-slate-800">{step.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 4: 토론 판정 결과 (Verdict Report) */}
              {activeTab === 'verdict' && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" /> 토론 종합 판정 결과 (Verdict Report)
                    </h4>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold rounded-lg text-xs">
                      성취도 최우수 (A)
                    </span>
                  </div>

                  <div className="bg-slate-850 p-4 rounded-2xl border border-emerald-500/30 text-slate-200 leading-relaxed">
                    <strong className="text-emerald-400 block mb-1">판정 요약:</strong>
                    {selectedRecord.detailFeedbackSummary}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
