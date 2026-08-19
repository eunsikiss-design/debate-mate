import React, { useState } from 'react';
import type { Topic } from '../../types';
import { OreoBuilder } from '../ModeA/OreoBuilder';
import { ConceptHighlighter } from '../ModeA/ConceptHighlighter';
import { Dumbbell, FileText, SearchCheck, Flag, Lightbulb, Mic, Table, ArrowLeft, BookOpen } from 'lucide-react';
import rubricsData from '../../data/rubrics.json';
import { SpeechService } from '../../services/speechService';

interface PrepRoomsMainProps {
  selectedTopic: Topic;
  onSelectTopic: (topic: Topic) => void;
}

export type PrepRoomId = 'argument' | 'evidence' | 'conclusion' | 'topic_analysis' | 'speech' | 'outline';

export const PrepRoomsMain: React.FC<PrepRoomsMainProps> = ({ selectedTopic, onSelectTopic }) => {
  const topics: Topic[] = rubricsData.topics as Topic[];
  const [activeRoom, setActiveRoom] = useState<PrepRoomId | null>(null);

  // Sub-room state: Evidence Room
  const [evidenceText, setEvidenceText] = useState('');
  const [evidenceAnalysis, setEvidenceAnalysis] = useState<string | null>(null);

  // Sub-room state: Conclusion Room
  const [conclusionText, setConclusionText] = useState('');

  // Sub-room state: Speech Room
  const [speechText, setSpeechText] = useState('');
  const [speechMetrics, setSpeechMetrics] = useState<{ wpm: number; fillerCount: number; words: string[] } | null>(null);

  // Sub-room state: Outline Room
  const [outlineAff, setOutlineAff] = useState({ opinion: '', reason: '', evidence: '' });
  const [outlineNeg, setOutlineNeg] = useState({ opinion: '', reason: '', evidence: '' });

  const rooms = [
    {
      id: 'argument' as PrepRoomId,
      num: '1.1',
      title: '토론 논증 연습실',
      desc: 'OREO(주장-이유-근거-강조) 구조화 가이드로 타당한 논증 입론 작성',
      icon: FileText,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300'
    },
    {
      id: 'evidence' as PrepRoomId,
      num: '1.2',
      title: '근거 분석 연습실',
      desc: '통계, 법률 조항, 사상가 이론 등 인용 증거의 신뢰성 및 연결 분석',
      icon: SearchCheck,
      color: 'from-sky-500/20 to-blue-500/20 border-sky-500/40 text-sky-300'
    },
    {
      id: 'conclusion' as PrepRoomId,
      num: '1.3',
      title: '결론 도출 연습실',
      desc: '상대 반론 수용·재반박 후 공공선 및 기본권 조화 마무리 강조',
      icon: Flag,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300'
    },
    {
      id: 'topic_analysis' as PrepRoomId,
      num: '1.4',
      title: '논제 파악 연습실',
      desc: '논제 용어 정의, 핵심 교과 개념 키워드 및 찬반 쟁점 지도 파악',
      icon: Lightbulb,
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300'
    },
    {
      id: 'speech' as PrepRoomId,
      num: '1.5',
      title: '스피치 연습실',
      desc: '발화 속도(WPM) 조절 및 불필요 추임새("어/음") 실시간 자가점검',
      icon: Mic,
      color: 'from-rose-500/20 to-pink-500/20 border-rose-500/40 text-rose-300'
    },
    {
      id: 'outline' as PrepRoomId,
      num: '1.6',
      title: '토론 개요표 작성 연습실',
      desc: '입론-교차조사-반론 연결 1페이지 찬반 통합 개요표 완성',
      icon: Table,
      color: 'from-teal-500/20 to-cyan-500/20 border-teal-500/40 text-teal-300'
    }
  ];

  const handleAnalyzeEvidence = () => {
    if (!evidenceText.trim()) return;
    const hasStat = /\d+%|\d+명|\d+건|통계|조사/.test(evidenceText);
    const hasLaw = /헌법|법률|조항|소년법|규제|제도/.test(evidenceText);
    const hasScholar = /롤스|소로|벤담|밀|아담스미스|사상가|이론/.test(evidenceText);

    let feedback = '근거 제시 유형: ';
    if (hasStat) feedback += '[통계/숫자 자료] ';
    if (hasLaw) feedback += '[법률/제도 조항] ';
    if (hasScholar) feedback += '[사상가 이론] ';
    if (!hasStat && !hasLaw && !hasScholar) feedback += '[일반 경험/사례] ';

    feedback += '\n• 평가: 근거가 논제의 주장을 객관적으로 뒷받침하는지 출처의 신뢰성을 재확인하세요.';
    setEvidenceAnalysis(feedback);
  };

  const handleCheckSpeech = () => {
    if (!speechText.trim()) return;
    const wpm = SpeechService.calculateWPM(speechText, 30);
    const filler = SpeechService.detectFillerWords(speechText);
    setSpeechMetrics({ wpm, fillerCount: filler.count, words: filler.words });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Dumbbell className="w-5 h-5" />
            <span>1. 토론 준비 연습실 (Debate Prep Practice Rooms)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">선택 논제:</span>
            <select
              value={selectedTopic.id}
              onChange={e => {
                const found = topics.find(t => t.id === e.target.value);
                if (found) onSelectTopic(found);
              }}
              className="bg-slate-800 border border-slate-700 text-teal-300 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none"
            >
              {topics.map(t => (
                <option key={t.id} value={t.id}>[{t.id}] {t.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
          <BookOpen className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-semibold">{selectedTopic.unit} — {selectedTopic.title}</strong>
            <span className="text-slate-400">핵심 개념: {selectedTopic.keywords.join(', ')}</span>
          </div>
        </div>
      </div>

      {!activeRoom ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const Icon = room.icon;

            return (
              <div
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl space-y-3 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[11px] rounded-md font-bold">
                      {room.num}
                    </span>
                    <div className={`p-2 rounded-xl border ${room.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-100 group-hover:text-teal-300 transition-colors">
                    {room.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {room.desc}
                  </p>
                </div>

                <div className="pt-2 text-xs font-semibold text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>연습실 입장하기</span> →
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Sub-Room Active Content View */
        <div className="space-y-4">
          <button
            onClick={() => setActiveRoom(null)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 6개 연습실 목록으로 돌아가기
          </button>

          {/* 1.1 토론 논증 연습실 */}
          {activeRoom === 'argument' && (
            <div className="space-y-4">
              <OreoBuilder topic={selectedTopic} onComplete={() => {}} savedOreo={null} />
            </div>
          )}

          {/* 1.2 근거 분석 연습실 */}
          {activeRoom === 'evidence' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-base">
                <SearchCheck className="w-5 h-5" /> 1.2 근거 분석 연습실 (Evidence Analysis)
              </div>
              <p className="text-xs text-slate-300">
                주장을 보완하기 위해 준비한 통계, 법률 조항, 사상가 이론 자료를 입력하면 객관성 및 신뢰도를 분석해 드립니다.
              </p>

              <textarea
                rows={4}
                value={evidenceText}
                onChange={e => setEvidenceText(e.target.value)}
                placeholder="예: 헌법 제37조 2항 또는 경찰청 통계자료에 의하면..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />

              <button
                onClick={handleAnalyzeEvidence}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-colors"
              >
                근거 신뢰성 및 유형 분석하기
              </button>

              {evidenceAnalysis && (
                <div className="bg-slate-850 p-4 rounded-xl border border-sky-500/30 text-xs space-y-1 animate-fade-in">
                  <strong className="text-sky-300 block font-semibold">분석 결과:</strong>
                  <pre className="text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">{evidenceAnalysis}</pre>
                </div>
              )}
            </div>
          )}

          {/* 1.3 결론 도출 연습실 */}
          {activeRoom === 'conclusion' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Flag className="w-5 h-5" /> 1.3 결론 도출 연습실 (Conclusion & Restatement)
              </div>
              <p className="text-xs text-slate-300">
                토론의 최종 강조 문장과 공공선/기본권 조화 메시지를 작성해보세요.
              </p>

              <textarea
                rows={3}
                value={conclusionText}
                onChange={e => setConclusionText(e.target.value)}
                placeholder="따라서 기본권과 공공선이 조화를 이루도록 해당 방안을..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />

              <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-700/80 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-amber-300 block">결론 도출 꿀팁:</span>
                <p>1. 내 주장의 핵심 요약 → 2. 예상 부작용에 대한 대안 제시 → 3. 사회적 합의 및 당위성 강조</p>
              </div>
            </div>
          )}

          {/* 1.4 논제 파악 연습실 */}
          {activeRoom === 'topic_analysis' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
                <Lightbulb className="w-5 h-5" /> 1.4 논제 파악 연습실 (Topic Breakdown)
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-purple-500/30 space-y-2 text-xs">
                <h4 className="font-bold text-purple-300 text-sm">[{selectedTopic.unit}] {selectedTopic.title}</h4>
                <div className="space-y-1 text-slate-300">
                  <div><strong>핵심 개념 태그:</strong> {selectedTopic.keywords.join(', ')}</div>
                  <div><strong>성취기준 (상):</strong> {selectedTopic.task_rubric.A}</div>
                </div>
              </div>

              <ConceptHighlighter keywords={selectedTopic.keywords} detectedKeywords={[]} />
            </div>
          )}

          {/* 1.5 스피치 연습실 */}
          {activeRoom === 'speech' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <Mic className="w-5 h-5" /> 1.5 스피치 연습실 (Speech & WPM / Filler Words)
              </div>

              <textarea
                rows={4}
                value={speechText}
                onChange={e => setSpeechText(e.target.value)}
                placeholder="발화할 내용을 적고 스피치 분석 버튼을 누르세요. (예: 어... 음... 제 생각에는...)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />

              <button
                onClick={handleCheckSpeech}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors"
              >
                발화 속도(WPM) & 추임새 카운팅 분석
              </button>

              {speechMetrics && (
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-slate-850 p-3 rounded-xl border border-sky-500/30">
                    <span className="text-slate-400 block">발화 속도</span>
                    <strong className="text-sky-300 text-base">{speechMetrics.wpm} WPM</strong>
                  </div>
                  <div className="bg-slate-850 p-3 rounded-xl border border-amber-500/30">
                    <span className="text-slate-400 block">감지된 추임새("어/음")</span>
                    <strong className="text-amber-300 text-base">{speechMetrics.fillerCount}회</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 1.6 토론 개요표 작성 연습실 */}
          {activeRoom === 'outline' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-base">
                <Table className="w-5 h-5" /> 1.6 토론 개요표 작성 연습실 (Debate Outline Table)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 찬성 개요 */}
                <div className="bg-teal-950/20 border border-teal-500/30 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-teal-300 text-sm">찬성 측 (Affirmative) 개요</h4>
                  <input
                    type="text"
                    placeholder="찬성 주장"
                    value={outlineAff.opinion}
                    onChange={e => setOutlineAff({ ...outlineAff, opinion: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 p-2 rounded-lg text-slate-100"
                  />
                  <textarea
                    rows={2}
                    placeholder="이유 및 근거"
                    value={outlineAff.reason}
                    onChange={e => setOutlineAff({ ...outlineAff, reason: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 p-2 rounded-lg text-slate-100"
                  />
                </div>

                {/* 반대 개요 */}
                <div className="bg-sky-950/20 border border-sky-500/30 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-sky-300 text-sm">반대 측 (Negative) 개요</h4>
                  <input
                    type="text"
                    placeholder="반대 주장"
                    value={outlineNeg.opinion}
                    onChange={e => setOutlineNeg({ ...outlineNeg, opinion: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 p-2 rounded-lg text-slate-100"
                  />
                  <textarea
                    rows={2}
                    placeholder="이유 및 근거"
                    value={outlineNeg.reason}
                    onChange={e => setOutlineNeg({ ...outlineNeg, reason: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 p-2 rounded-lg text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
