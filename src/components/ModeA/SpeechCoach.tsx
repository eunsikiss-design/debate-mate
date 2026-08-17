import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, RefreshCw, Gauge, AlertCircle, ArrowLeft } from 'lucide-react';
import type { Topic, OreoData, ChatMessage } from '../../types';
import { speechService, SpeechService } from '../../services/speechService';
import { GeminiService } from '../../services/geminiService';
import { ConceptHighlighter } from './ConceptHighlighter';
import { OreoBuilder } from './OreoBuilder';

interface SpeechCoachProps {
  topic: Topic;
  onBack: () => void;
}

export const SpeechCoach: React.FC<SpeechCoachProps> = ({ topic, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(true);
  const [oreoData, setOreoData] = useState<OreoData | null>(null);
  const [allDetectedKeywords, setAllDetectedKeywords] = useState<string[]>([]);
  const [sttSupported, setSttSupported] = useState(true);

  // Speech Coaching Metrics
  const [lastWpm, setLastWpm] = useState<number | null>(null);
  const [lastFillerCount, setLastFillerCount] = useState<number | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const speechStartTimeRef = useRef<number>(0);

  useEffect(() => {
    setSttSupported(speechService.isSTTSupported());

    const welcomeMsg: ChatMessage = {
      id: 'msg_welcome',
      role: 'assistant',
      text: `안녕하세요! 통합사회 AI 토론 코치입니다. 논제 ["${topic.title}"]에 대한 학생분의 생각을 편하게 말씀해 주세요. 먼저 OREO 큐카드를 작성하시면 논리를 다듬기 훨씬 쉽습니다!`,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMsg]);
  }, [topic]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText, isLoading]);

  const toggleListening = () => {
    if (isListening) {
      const durationSec = speechService.stopListening();
      setIsListening(false);

      if (inputText.trim()) {
        handleSubmitUserSpeech(inputText, durationSec);
      }
    } else {
      setInputText('');
      setInterimText('');
      speechStartTimeRef.current = Date.now();

      speechService.startListening(
        (text, isFinal) => {
          if (isFinal) {
            setInputText(prev => (prev ? prev + ' ' + text : text));
            setInterimText('');
            const detected = SpeechService.checkKeywordHighlights(text, topic.keywords);
            setAllDetectedKeywords(prev => Array.from(new Set([...prev, ...detected])));
          } else {
            setInterimText(text);
            const detected = SpeechService.checkKeywordHighlights(text, topic.keywords);
            setAllDetectedKeywords(prev => Array.from(new Set([...prev, ...detected])));
          }
        },
        (err) => {
          console.warn('STT Error callback:', err);
          setIsListening(false);
        }
      );
      setIsListening(true);
    }
  };

  const handleSubmitUserSpeech = async (textToSend: string, durationSecOverride?: number) => {
    if (!textToSend.trim() || isLoading) return;

    const durationSec = durationSecOverride || Math.max(2, (Date.now() - speechStartTimeRef.current) / 1000);
    const wpm = SpeechService.calculateWPM(textToSend, durationSec);
    const fillerInfo = SpeechService.detectFillerWords(textToSend);
    const detected = SpeechService.checkKeywordHighlights(textToSend, topic.keywords);

    setAllDetectedKeywords(prev => Array.from(new Set([...prev, ...detected])));
    setLastWpm(wpm);
    setLastFillerCount(fillerInfo.count);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      wpm,
      fillerCount: fillerInfo.count,
      detectedKeywords: detected
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setInterimText('');
    setIsLoading(true);

    try {
      const aiReply = await GeminiService.generateModeACounterArgument(
        topic,
        textToSend,
        oreoData
      );

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);

      if (isTTSActive) {
        speechService.speak(aiReply);
      }
    } catch (err) {
      console.error('Error generating AI counter argument:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualTextSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    }
    handleSubmitUserSpeech(inputText);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Navigation & Topic Banner */}
      <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] font-bold rounded-md">
                모드 A: 1:1 연습
              </span>
              <span className="text-xs text-slate-400 font-mono">{topic.unit}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
              {topic.title}
            </h2>
          </div>
        </div>

        {/* TTS Mute Toggle */}
        <button
          onClick={() => {
            const next = !isTTSActive;
            setIsTTSActive(next);
            if (!next) speechService.stopSpeaking();
          }}
          className={`p-2.5 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 ${
            isTTSActive
              ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
          title={isTTSActive ? 'AI 음성 읽기 켜짐 (클릭 시 끄기)' : 'AI 음성 읽기 꺼짐'}
        >
          {isTTSActive ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">{isTTSActive ? 'TTS 켜짐' : '음소거'}</span>
        </button>
      </div>

      {/* Oreo Scaffolding Builder */}
      <OreoBuilder topic={topic} onComplete={setOreoData} savedOreo={oreoData} />

      {/* Smart Concept Tag Highlighter */}
      <ConceptHighlighter keywords={topic.keywords} detectedKeywords={allDetectedKeywords} />

      {/* Speech Analytics Coaching Badge */}
      {(lastWpm !== null || lastFillerCount !== null) && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-slate-200">실시간 스피치 코칭:</span>
          </div>

          <div className="flex items-center gap-3">
            {lastWpm !== null && (
              <div className="flex items-center gap-1 bg-sky-950/80 border border-sky-800/80 px-2.5 py-1 rounded-lg text-sky-300">
                <span>발화 속도:</span>
                <strong className="font-bold">{lastWpm} WPM</strong>
                <span className="text-[10px] text-slate-400">
                  ({lastWpm < 80 ? '천천히' : lastWpm > 180 ? '빠름' : '적절'})
                </span>
              </div>
            )}

            {lastFillerCount !== null && (
              <div className={`flex items-center gap-1 border px-2.5 py-1 rounded-lg ${
                lastFillerCount === 0 
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/80 border-amber-800 text-amber-300'
              }`}>
                <span>추임새("어/음"):</span>
                <strong className="font-bold">{lastFillerCount}회</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Conversation Scroll Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 min-h-[320px] max-h-[480px] overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[82%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-tr-none'
                    : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>

              <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span>{msg.timestamp}</span>
                {msg.wpm && <span>• {msg.wpm} WPM</span>}
                {msg.fillerCount !== undefined && msg.fillerCount > 0 && (
                  <span className="text-amber-400">• 추임새 {msg.fillerCount}회</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl text-xs text-teal-300 animate-pulse">
              AI 코치가 발화를 분석하고 반론 질문을 준비하는 중...
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar & Controls */}
      <form onSubmit={handleManualTextSend} className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2">
        {!sttSupported && (
          <div className="text-[11px] text-amber-400 flex items-center gap-1 px-2">
            <AlertCircle className="w-3.5 h-3.5" /> 브라우저 STT가 미지원되어 텍스트 직접 입력 모드로 작동합니다.
          </div>
        )}

        {isListening && (
          <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/30 px-3.5 py-2 rounded-xl text-xs text-rose-300 animate-pulse">
            <span className="font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              음성 청취 중... {interimText ? `"${interimText}"` : '말씀하세요'}
            </span>
            <button
              type="button"
              onClick={toggleListening}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[11px]"
            >
              종료 및 전송
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl font-bold transition-all flex items-center justify-center ${
              isListening
                ? 'bg-rose-600 text-white animate-bounce shadow-lg shadow-rose-600/30'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20'
            }`}
            title={isListening ? '녹음 중지' : '실시간 음성 발화 시작 (STT)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            placeholder={isListening ? '음성을 인식하는 중입니다...' : '발언할 내용을 입력하거나 마이크 버튼을 눌러 말씀하세요'}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-xl font-bold transition-all ${
              inputText.trim() && !isLoading
                ? 'bg-gradient-to-r from-teal-500 to-sky-500 text-white hover:opacity-90 shadow-md'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
