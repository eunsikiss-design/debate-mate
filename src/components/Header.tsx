import React, { useState, useEffect } from 'react';
import { Settings, Wifi, WifiOff, Lock, Unlock, User, Users } from 'lucide-react';
import { wakeLockService } from '../services/wakeLockService';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';
import type { AppSettings } from '../types';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenDashboard: () => void;
  activeMode: 'home' | 'modeA' | 'modeB' | 'dashboard';
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenDashboard,
  activeMode,
  onGoHome
}) => {
  const [isWakeActive, setIsWakeActive] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkInterval = setInterval(() => {
      setIsWakeActive(wakeLockService.isActive());
      setQueueCount(StorageService.getOfflineQueue().length);
      setSettings(StorageService.getSettings());
      setHasGeminiKey(GeminiService.isApiKeyConfigured());
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(checkInterval);
    };
  }, []);

  const toggleWakeLock = async () => {
    if (isWakeActive) {
      await wakeLockService.release();
      setIsWakeActive(false);
    } else {
      const ok = await wakeLockService.request();
      setIsWakeActive(ok);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & App Name */}
        <div 
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center font-bold text-white shadow-lg shadow-teal-500/20 text-lg">
            DM
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-teal-300 via-sky-200 to-white bg-clip-text text-transparent">
              Debate Mate
            </h1>
            <p className="text-[11px] text-teal-400 font-medium flex items-center gap-1">
              통합사회 AI 토론 코치
              {hasGeminiKey ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
                  Gemini API 연결됨
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-medium border border-slate-700">
                  시뮬레이션 모드
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center gap-2">
          {/* User Info Badge */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-xs text-slate-300">
            <span className="flex items-center gap-1 text-teal-400 font-semibold">
              <User className="w-3.5 h-3.5" />
              {settings.studentIdName || '10101 홍길동'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-sky-400">
              <Users className="w-3.5 h-3.5" />
              {settings.teamName || '1모둠'}
            </span>
          </div>

          {/* Screen WakeLock Button */}
          <button
            onClick={toggleWakeLock}
            title={isWakeActive ? '화면 꺼짐 방지 중 (클릭 시 해제)' : '화면 꺼짐 방지 (클릭 시 활성화)'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isWakeActive 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                : 'bg-slate-800 text-slate-400 border border-slate-700/50 hover:bg-slate-700'
            }`}
          >
            {isWakeActive ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isWakeActive ? '절전 방지' : '절전 켜짐'}</span>
          </button>

          {/* Network Queue Badge */}
          {!isOnline || queueCount > 0 ? (
            <div 
              title={isOnline ? `오프라인 대기 큐 ${queueCount}건` : '네트워크 연결 불안정'}
              className="flex items-center gap-1 px-2 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold"
            >
              <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{queueCount > 0 ? `${queueCount}건 대기` : '오프라인'}</span>
            </div>
          ) : (
            <div title="온라인 연결 정상" className="hidden sm:flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs">
              <Wifi className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Teacher Dashboard Button */}
          <button
            onClick={onOpenDashboard}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMode === 'dashboard'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            대시보드
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className={`p-1.5 rounded-lg border transition-colors ${
              hasGeminiKey
                ? 'bg-teal-500/10 border-teal-500/40 text-teal-300 hover:bg-teal-500/20'
                : 'bg-slate-800 border-slate-700/80 text-slate-300 hover:bg-slate-700'
            }`}
            title={hasGeminiKey ? 'Gemini API 연동 중' : '설정 (Gemini API 키 입력)'}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
