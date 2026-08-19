import React, { useState } from 'react';
import type { Topic, ChatMessage } from '../../types';
import { Bot, MessageSquare, HelpCircle, RefreshCcw, Sparkles, BookOpen, Send, ArrowLeft } from 'lucide-react';
import rubricsData from '../../data/rubrics.json';
import { GeminiService } from '../../services/geminiService';
import { speechService } from '../../services/speechService';

interface TutoringMainProps {
  selectedTopic: Topic;
  onSelectTopic: (topic: Topic) => void;
}

export type TutorModuleId = 'opening' | 'rebuttal' | 'questioning' | 'topic_interpret' | 'closing';

export const TutoringMain: React.FC<TutoringMainProps> = ({ selectedTopic, onSelectTopic }) => {
  const topics: Topic[] = rubricsData.topics as Topic[];
  const [activeModule, setActiveModule] = useState<TutorModuleId | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const modules = [
    {
      id: 'opening' as TutorModuleId,
      num: '2.1',
      title: '입론하기 튜터링',
      desc: '논제에 대한 입장을 명확히 하고 OREO 4단계 입론을 구체화하는 코칭',
      icon: MessageSquare,
      color: 'border-sky-500/40 text-sky-300'
    },
    {
      id: 'rebuttal' as TutorModuleId,
      num: '2.2',
      title: '반론하기 튜터링',
      desc: '상대측 주장의 맹점을 파악하고 설득력 있는 재반론을 구성하는 코칭',
      icon: RefreshCcw,
      color: 'border-amber-500/40 text-amber-300'
    },
    {
      id: 'questioning' as TutorModuleId,
      num: '2.3',
      title: '질문하기 (교차조사) 튜터링',
      desc: '상대방의 논리적 허점을 찌르는 정밀한 질문 및 심문 기법 코칭',
      icon: HelpCircle,
      color: 'border-rose-500/40 text-rose-300'
    },
    {
      id: 'topic_interpret' as TutorModuleId,
      num: '2.4',
      title: '논제 해석하기 튜터링',
      desc: '통합사회 교과서 사상가(롤스, 소로 등) 이론 관점으로 논제를 다각도 해석',
      icon: BookOpen,
      color: 'border-purple-500/40 text-purple-300'
    },
    {
      id: 'closing' as TutorModuleId,
      num: '2.5',
      title: '최종 발언하기 튜터링',
      desc: '토론 전반의 핵심 요점 정리 및 감명 깊은 최종 총평 작성 코칭',
      icon: Sparkles,
      color: 'border-emerald-500/40 text-emerald-300'
    }
  ];

  const handleStartModule = (modId: TutorModuleId) => {
    setActiveModule(modId);
    const modObj = modules.find(m => m.id === modId);

    const initMsg: ChatMessage = {
      id: `tut_init_${Date.now()}`,
      role: 'assistant',
      text: `안녕하세요! AI 튜터입니다. [${modObj?.title}] 코칭에 오신 것을 환영합니다.\n논제 ["${selectedTopic.title}"]에 대해 현재 생각하고 계신 내용을 편하게 적어주시면 단계별로 피드백하고 질문을 드리겠습니다!`,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initMsg]);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiReply = await GeminiService.generateModeACounterArgument(
        selectedTopic,
        `[AI 튜터링 단계: ${activeModule}] ${textToSend}`
      );

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      speechService.speak(aiReply);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Bot className="w-5 h-5" />
            <span>2. AI 튜터링 (AI Tutoring Modules)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">선택 논제:</span>
            <select
              value={selectedTopic.id}
              onChange={e => {
                const found = topics.find(t => t.id === e.target.value);
                if (found) onSelectTopic(found);
              }}
              className="bg-slate-800 border border-slate-700 text-sky-300 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none"
            >
              {topics.map(t => (
                <option key={t.id} value={t.id}>[{t.id}] {t.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!activeModule ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;

            return (
              <div
                key={mod.id}
                onClick={() => handleStartModule(mod.id)}
                className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl space-y-3 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[11px] rounded-md font-bold">
                      {mod.num}
                    </span>
                    <div className={`p-2 rounded-xl border bg-slate-850 ${mod.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-100 group-hover:text-sky-300 transition-colors">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-2 text-xs font-semibold text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>1:1 코칭 시작하기</span> →
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tutoring Chat Workspace */
        <div className="space-y-4 max-w-4xl mx-auto">
          <button
            onClick={() => setActiveModule(null)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 5개 튜터링 목록으로 돌아가기
          </button>

          {/* Active Chat */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 min-h-[360px] max-h-[480px] overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 px-1">{msg.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} className="flex gap-2">
            <input
              type="text"
              placeholder="AI 튜터에게 질문하거나 자신의 의견을 작성하세요..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-5 py-3 bg-sky-500 hover:bg-sky-400 font-bold text-white rounded-xl text-xs shadow-md transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
