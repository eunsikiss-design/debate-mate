import { useState } from 'react';
import type { Topic } from './types';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { GeneralRubricModal } from './components/GeneralRubricModal';
import { NavigationTabs, MainTabType } from './components/NavigationTabs';
import { PrepRoomsMain } from './components/PrepRooms/PrepRoomsMain';
import { TutoringMain } from './components/AITutoring/TutoringMain';
import { DebateArenaMain } from './components/DebateArena/DebateArenaMain';
import { ArchiveMain } from './components/Archive/ArchiveMain';
import rubricsData from './data/rubrics.json';

export function App() {
  const topics: Topic[] = rubricsData.topics as Topic[];
  const [selectedTopic, setSelectedTopic] = useState<Topic>(topics[0]);
  const [activeTab, setActiveTab] = useState<MainTabType>('prep');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [lastRecordId, setLastRecordId] = useState<string | null>(null);

  const handleCompleteDebate = (recordId: string) => {
    setLastRecordId(recordId);
    setActiveTab('archive');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Global Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDashboard={() => setActiveTab('archive')}
        activeMode={activeTab === 'archive' ? 'dashboard' : 'home'}
        onGoHome={() => setActiveTab('prep')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 animate-fade-in">
        {/* Navigation Tabs */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab 1: 토론 준비 연습실 */}
        {activeTab === 'prep' && (
          <PrepRoomsMain
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
          />
        )}

        {/* Tab 2: AI 튜터링 */}
        {activeTab === 'tutoring' && (
          <TutoringMain
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
          />
        )}

        {/* Tab 3: AI와 토론하기 */}
        {activeTab === 'arena' && (
          <DebateArenaMain
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            onCompleteDebate={handleCompleteDebate}
          />
        )}

        {/* Tab 4: 기록실 */}
        {activeTab === 'archive' && (
          <ArchiveMain
            highlightRecordId={lastRecordId}
          />
        )}
      </main>

      {/* Global Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <GeneralRubricModal
        isOpen={isRubricOpen}
        onClose={() => setIsRubricOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 text-center py-4 text-xs text-slate-500">
        Debate Mate © 2026 고등학교 통합사회 AI 토론 코치 & 실전 평가 시스템
      </footer>
    </div>
  );
}

export default App;
