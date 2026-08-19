import React, { useState } from 'react';
import type { Topic, DebateOptions, RubricResult, ChatMessage, DebateFlowStep } from '../../types';
import { Swords, Settings2, Mic, FileText, Clock, Sparkles, Send, Volume2, Gauge, CheckCircle2, ArrowRight } from 'lucide-react';
import rubricsData from '../../data/rubrics.json';
import { GeminiService } from '../../services/geminiService';
import { speechService, SpeechService } from '../../services/speechService';
import { StorageService } from '../../services/storageService';
import { ConceptHighlighter } from '../ModeA/ConceptHighlighter';
import { AudioRecorderUI } from '../ModeB/AudioRecorderUI';

interface DebateArenaMainProps {
  selectedTopic: Topic;
  onSelectTopic: (topic: Topic) => void;
  onCompleteDebate: (recordId: string) => void;
}

export const DebateArenaMain: React.FC<DebateArenaMainProps> = ({
  selectedTopic,
  onSelectTopic,
  onCompleteDebate
}) => {
  const topics: Topic[] = rubricsData.topics as Topic[];

  // Options State
  const [options, setOptions] = useState<DebateOptions>({
    model: 'one_on_one',
    type: 'speech',
    targetTimeSeconds: 60,
    realtimeFeedback: true,
    userRole: 'affirmative'
  });

  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [flowSteps, setFlowSteps] = useState<DebateFlowStep[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleStartArena = () => {
    setIsSessionStarted(true);
    const startMsg: ChatMessage = {
      id: `arena_start_${Date.now()}`,
      role: 'assistant',
      text: `[실전 토론 시작] 선택하신 옵션(${options.model === 'one_on_one' ? '1:1 토론' : '찬반 토론'}, ${options.type === 'speech' ? '음성 스피치형' : '게시글 텍스트형'}, 목표시간: ${options.targetTimeSeconds ? `${options.targetTimeSeconds / 60}분` : '자율'})에 따라 토론을 시작합니다. 논제 ["${selectedTopic.title}"]에 대한 입론을 말씀/작성해 주세요!`,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([startMsg]);

    const initialFlow: DebateFlowStep = {
      stepIndex: 1,
      speaker: options.userRole === 'affirmative' ? '찬성측(사용자)' : '반대측(사용자)',
      phase: '입론',
      summary: '입론 대기 중...',
      keyPoint: selectedTopic.keywords[0] || '입론 쟁점'
    };
    setFlowSteps([initialFlow]);
  };

  const handleSendSpeechOrText = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const wpm = SpeechService.calculateWPM(textToSend, options.targetTimeSeconds || 60);
    const filler = SpeechService.detectFillerWords(textToSend);
    const kwMatch = SpeechService.checkKeywordHighlights(textToSend, selectedTopic.keywords);

    setDetectedKeywords(prev => Array.from(new Set([...prev, ...kwMatch])));

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      wpm,
      fillerCount: filler.count
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiReply = await GeminiService.generateModeACounterArgument(
        selectedTopic,
        textToSend
      );

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);

      // Update Flow Diagram steps
      const newStep: DebateFlowStep = {
        stepIndex: flowSteps.length + 1,
        speaker: 'AI 토론자',
        phase: '반론',
        summary: aiReply.slice(0, 40) + '...',
        keyPoint: kwMatch[0] || selectedTopic.keywords[1] || '반론 쟁점',
        counteredStepIndex: flowSteps.length
      };
      setFlowSteps(prev => [...prev, newStep]);

      if (options.type === 'speech') {
        speechService.speak(aiReply);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishAndEvaluate = async () => {
    setIsEvaluating(true);

    const rubricRes: RubricResult = GeminiService.generateSimulatedRubricResult(selectedTopic);
    const settings = StorageService.getSettings();

    const recordId = `rec_${Date.now()}`;
    const newRecord = {
      id: recordId,
      timestamp: new Date().toLocaleString('ko-KR'),
      studentIdName: settings.studentIdName || '10101 홍길동',
      teamName: settings.teamName || '1모둠',
      topicId: selectedTopic.id,
      topicTitle: selectedTopic.title,
      affSummaryGrade: `찬성:${rubricRes.affirmative.task_grade}`,
      negSummaryGrade: `반대:${rubricRes.negative.task_grade}`,
      detailFeedbackSummary: rubricRes.summary,
      audioUrl: 'https://storage...',
      options,
      chatHistory: messages,
      debateFlow: flowSteps,
      rawRubricResult: rubricRes
    };

    StorageService.saveRecord(newRecord as any);
    setIsEvaluating(false);
    onCompleteDebate(recordId);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <Swords className="w-5 h-5" />
            <span>3. AI와 토론하기 (AI Debate Arena)</span>
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
      </div>

      {!isSessionStarted ? (
        /* Options Selection Form */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-base border-b border-slate-800 pb-3">
            <Settings2 className="w-5 h-5" /> 토론 모형 및 옵션 설정 (3.1 Options Form)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
            {/* 1. 토론 모형 */}
            <div className="space-y-2 bg-slate-850 p-4 rounded-2xl border border-slate-700/80">
              <label className="font-bold text-white block">1. 토론 모형 선택</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, model: 'one_on_one' })}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    options.model === 'one_on_one'
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  1:1 대결 토론
                </button>
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, model: 'affirmative_vs_negative' })}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    options.model === 'affirmative_vs_negative'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  찬반 팀 토론
                </button>
              </div>
            </div>

            {/* 2. 토론 유형 */}
            <div className="space-y-2 bg-slate-850 p-4 rounded-2xl border border-slate-700/80">
              <label className="font-bold text-white block">2. 토론 유형 선택</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, type: 'speech' })}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    options.type === 'speech'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" /> 음성 스피치형
                </button>
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, type: 'text_post' })}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    options.type === 'text_post'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> 게시글 텍스트형
                </button>
              </div>
            </div>

            {/* 3. 목표 발언 시간 */}
            <div className="space-y-2 bg-slate-850 p-4 rounded-2xl border border-slate-700/80">
              <label className="font-bold text-white block flex items-center gap-1">
                <Clock className="w-4 h-4 text-teal-400" /> 3. 목표 발언 시간 제한
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[60, 120, 180, 0].map((secs) => (
                  <button
                    key={secs}
                    type="button"
                    onClick={() => setOptions({ ...options, targetTimeSeconds: secs as any })}
                    className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                      options.targetTimeSeconds === secs
                        ? 'bg-teal-500 text-slate-950 border-teal-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {secs === 0 ? '자율' : `${secs / 60}분`}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. 나의 입장 선택 */}
            <div className="space-y-2 bg-slate-850 p-4 rounded-2xl border border-slate-700/80">
              <label className="font-bold text-white block">4. 나의 토론 입장</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, userRole: 'affirmative' })}
                  className={`p-2.5 rounded-xl border text-xs font-bold ${
                    options.userRole === 'affirmative'
                      ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  찬성 측 (Affirmative)
                </button>
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, userRole: 'negative' })}
                  className={`p-2.5 rounded-xl border text-xs font-bold ${
                    options.userRole === 'negative'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  반대 측 (Negative)
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleStartArena}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 via-sky-500 to-emerald-500 hover:opacity-90 text-white font-extrabold rounded-2xl shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 text-sm transition-all scale-105"
            >
              <Swords className="w-5 h-5" /> 실전 AI 토론 시작하기
            </button>
          </div>
        </div>
      ) : (
        /* Active Debate Arena Session */
        <div className="space-y-4">
          <ConceptHighlighter keywords={selectedTopic.keywords} detectedKeywords={detectedKeywords} />

          {/* Messages */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4 shadow-xl">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[82%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="text-[10px] text-slate-500 px-1">{msg.timestamp} {msg.wpm && `• ${msg.wpm} WPM`}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={e => { e.preventDefault(); handleSendSpeechOrText(inputText); }} className="flex gap-2">
            <input
              type="text"
              placeholder={options.type === 'speech' ? '음성을 발화하거나 텍스트를 입력하세요...' : '토론 게시글 입론/반론 작성...'}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-90 font-bold text-white rounded-xl text-xs shadow-md transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Finish & Evaluate Button */}
          <div className="pt-2 flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400">토론이 완료되면 판정 및 기록실 저장을 실행하세요.</span>
            <button
              onClick={handleFinishAndEvaluate}
              disabled={isEvaluating}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all"
            >
              토론 종료 및 판정·기록실 저장 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
