import React, { useState } from 'react';
import { X, Key, Table, User, Users, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import type { AppSettings } from '../types';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [showKey, setShowKey] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const isKeyActive = GeminiService.isApiKeyConfigured();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(settings);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white">Gemini API 및 환경 설정</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-sm">
          {/* Gemini API Key Section */}
          <div className="space-y-2 bg-slate-850 p-4 rounded-xl border border-teal-500/30">
            <div className="flex items-center justify-between">
              <label className="font-bold text-teal-300 flex items-center gap-1.5 text-sm">
                <Key className="w-4 h-4 text-teal-400" /> Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 px-2 py-0.5 rounded-lg border border-teal-500/40 font-semibold flex items-center gap-1 transition-colors"
              >
                무료 키 발급받기 <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={settings.geminiApiKey}
                onChange={e => setSettings({ ...settings, geminiApiKey: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200"
              >
                {showKey ? '숨기기' : '보기'}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                {isKeyActive ? (
                  <strong className="text-emerald-400 font-semibold">Gemini Flash API 연동 활성화됨</strong>
                ) : (
                  '미입력 시 시뮬레이션 인공지능 코치 모드로 작동합니다.'
                )}
              </span>
            </div>
          </div>

          {/* Gemini Model Select */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-200">Gemini Flash 모델 선택</label>
            <select
              value={settings.geminiModel}
              onChange={e => setSettings({ ...settings, geminiModel: e.target.value as any })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (권장: 0.5초 저지연 스트리밍)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (최신 멀티모달 오디오 분석)</option>
            </select>
          </div>

          {/* Google Sheets Webhook URL */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between font-semibold text-slate-200">
              <span className="flex items-center gap-1.5 text-sky-300">
                <Table className="w-4 h-4" /> 교사용 Google Sheets Webhook URL
              </span>
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={settings.googleSheetsUrl}
              onChange={e => setSettings({ ...settings, googleSheetsUrl: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-400">
              미설정 시에도 내장 로컬 대시보드 저장 및 CSV/1클릭 복사 기능이 정상 작동합니다.
            </p>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-300">
                <User className="w-3.5 h-3.5 text-teal-400" /> 학번/이름
              </label>
              <input
                type="text"
                value={settings.studentIdName}
                onChange={e => setSettings({ ...settings, studentIdName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                placeholder="예: 10101 홍길동"
              />
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-300">
                <Users className="w-3.5 h-3.5 text-sky-400" /> 모둠명
              </label>
              <input
                type="text"
                value={settings.teamName}
                onChange={e => setSettings({ ...settings, teamName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                placeholder="예: 1모둠"
              />
            </div>
          </div>

          {/* Toast / Actions */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              {saveToast && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold animate-bounce">
                  <CheckCircle2 className="w-4 h-4" /> 성공적으로 저장되었습니다!
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
              >
                닫기
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 rounded-xl text-xs font-bold text-white shadow-lg shadow-teal-500/20 transition-all"
              >
                저장하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
