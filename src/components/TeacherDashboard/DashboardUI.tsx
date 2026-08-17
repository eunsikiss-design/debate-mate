import React, { useState, useEffect } from 'react';
import { Download, Copy, RefreshCw, Trash2, ArrowLeft, CheckCircle2, Play, Search } from 'lucide-react';
import type { SavedEvaluationRecord } from '../../types';
import { StorageService } from '../../services/storageService';

interface DashboardUIProps {
  onBack: () => void;
}

export const DashboardUI: React.FC<DashboardUIProps> = ({ onBack }) => {
  const [records, setRecords] = useState<SavedEvaluationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<SavedEvaluationRecord | null>(null);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    setRecords(StorageService.getRecords());
    setOfflineCount(StorageService.getOfflineQueue().length);
  };

  const handleProcessQueue = async () => {
    setIsProcessingQueue(true);
    const synced = await StorageService.processOfflineQueue();
    setIsProcessingQueue(false);
    loadRecords();
    alert(`오프라인 큐에서 ${synced}건이 Google Sheets로 동기화되었습니다.`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 제출 기록을 삭제하시겠습니까?')) {
      StorageService.deleteRecord(id);
      loadRecords();
    }
  };

  const handleExportCSV = () => {
    StorageService.exportToCSV(filteredRecords);
  };

  const handleCopySingleRow = (record: SavedEvaluationRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const row = `${record.timestamp}\t${record.studentIdName}\t${record.teamName}\t${record.topicId}\t${record.affSummaryGrade}\t${record.negSummaryGrade}\t${record.detailFeedbackSummary}\t${record.audioUrl}`;
    navigator.clipboard.writeText(row);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  const filteredRecords = records.filter(r => 
    r.studentIdName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.topicTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.topicId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] font-bold rounded-md">
              교사용 데이터 관리
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
              실전 평가 자동 누적 대시보드
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {offlineCount > 0 && (
            <button
              onClick={handleProcessQueue}
              disabled={isProcessingQueue}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessingQueue ? 'animate-spin' : ''}`} />
              <span>오프라인 큐 재전송 ({offlineCount}건)</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>CSV 다운로드</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Toast */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="학번/이름, 모둠명, 논제 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {copyToast && (
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-bounce">
            <CheckCircle2 className="w-4 h-4" /> 스프레드시트 탭 클립보드 복사 완료!
          </span>
        )}
      </div>

      {/* Table Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">일시</th>
                <th className="px-4 py-3.5">학번/이름</th>
                <th className="px-4 py-3.5">모둠</th>
                <th className="px-4 py-3.5">논제 ID</th>
                <th className="px-4 py-3.5">찬성측 등급</th>
                <th className="px-4 py-3.5">반대측 등급</th>
                <th className="px-4 py-3.5">상세 피드백 요약</th>
                <th className="px-4 py-3.5 text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    제출된 평가 데이터가 없습니다. 모드 B에서 평가를 완료한 후 제출해 보세요.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">{rec.timestamp}</td>
                    <td className="px-4 py-3 font-semibold text-slate-100">{rec.studentIdName}</td>
                    <td className="px-4 py-3 text-sky-400 font-medium">{rec.teamName}</td>
                    <td className="px-4 py-3 font-mono text-teal-400">{rec.topicId}</td>
                    <td className="px-4 py-3 max-w-[140px] truncate">{rec.affSummaryGrade}</td>
                    <td className="px-4 py-3 max-w-[140px] truncate">{rec.negSummaryGrade}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-slate-400">{rec.detailFeedbackSummary}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => handleCopySingleRow(rec, e)}
                          title="1행 복사 (구글 시트에 붙여넣기)"
                          className="p-1.5 bg-slate-800 hover:bg-teal-900/40 text-teal-300 rounded-lg transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(rec.id, e)}
                          title="삭제"
                          className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl text-slate-100 text-xs sm:text-sm max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-teal-400 font-mono">{selectedRecord.topicId} • {selectedRecord.timestamp}</span>
                <h3 className="font-bold text-base text-white">{selectedRecord.topicTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-semibold"
              >
                닫기
              </button>
            </div>

            <div className="space-y-2 bg-slate-850 p-4 rounded-2xl border border-slate-700/80">
              <div><strong>학생/모둠:</strong> {selectedRecord.studentIdName} ({selectedRecord.teamName})</div>
              <div><strong>찬성측 요약 등급:</strong> <span className="text-teal-300">{selectedRecord.affSummaryGrade}</span></div>
              <div><strong>반대측 요약 등급:</strong> <span className="text-sky-300">{selectedRecord.negSummaryGrade}</span></div>
            </div>

            <div className="space-y-1">
              <strong className="text-amber-300 block">종합 피드백 요약</strong>
              <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                {selectedRecord.detailFeedbackSummary}
              </p>
            </div>

            {selectedRecord.audioUrl && (
              <div className="space-y-1 pt-2">
                <strong className="text-teal-300 block flex items-center gap-1">
                  <Play className="w-3.5 h-3.5" /> 토론 오디오 재생
                </strong>
                <audio controls src={selectedRecord.audioUrl} className="w-full h-9 rounded-lg" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
