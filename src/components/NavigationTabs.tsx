import React from 'react';
import { Dumbbell, Bot, Swords, FolderKanban } from 'lucide-react';

export type MainTabType = 'prep' | 'tutoring' | 'arena' | 'archive';

interface NavigationTabsProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'prep' as MainTabType,
      label: '토론 준비 연습실',
      subLabel: '6대 요소 연습',
      icon: Dumbbell,
      color: 'from-emerald-500 to-teal-500',
      activeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
    },
    {
      id: 'tutoring' as MainTabType,
      label: 'AI 튜터링',
      subLabel: '단계별 1:1 코칭',
      icon: Bot,
      color: 'from-sky-500 to-blue-500',
      activeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/50'
    },
    {
      id: 'arena' as MainTabType,
      label: 'AI와 토론하기',
      subLabel: '옵션 설정 & 실전 토론',
      icon: Swords,
      color: 'from-teal-500 to-indigo-500',
      activeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/50'
    },
    {
      id: 'archive' as MainTabType,
      label: '기록실',
      subLabel: '전사본·개요표·흐름·판정',
      icon: FolderKanban,
      color: 'from-amber-500 to-orange-500',
      activeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50'
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl border text-left transition-all duration-200 flex items-center gap-2.5 ${
              isActive
                ? `${tab.activeColor} shadow-lg font-bold scale-[1.02]`
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className={`p-2 rounded-lg ${isActive ? 'bg-slate-900/80 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs sm:text-sm font-bold tracking-tight leading-none">{tab.label}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-medium truncate">{tab.subLabel}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
