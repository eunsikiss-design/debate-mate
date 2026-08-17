import { useState } from 'react';
import type { Topic } from './types';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { GeneralRubricModal } from './components/GeneralRubricModal';
import { TopicSelector } from './components/TopicSelector';
import { SpeechCoach } from './components/ModeA/SpeechCoach';
import { AudioRecorderUI } from './components/ModeB/AudioRecorderUI';
import { DashboardUI } from './components/TeacherDashboard/DashboardUI';

type ActiveView = 'home' | 'modeA' | 'modeB' | 'dashboard';

export function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);

  const handleSelectModeA = (topic: Topic) => {
    setSelectedTopic(topic);
    setActiveView('modeA');
  };

  const handleSelectModeB = (topic: Topic) => {
    setSelectedTopic(topic);
    setActiveView('modeB');
  };

  const handleGoHome = () => {
    setActiveView('home');
    setSelectedTopic(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Global Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDashboard={() => setActiveView('dashboard')}
        activeMode={activeView}
        onGoHome={handleGoHome}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 animate-fade-in">
        {activeView === 'home' && (
          <TopicSelector
            onSelectModeA={handleSelectModeA}
            onSelectModeB={handleSelectModeB}
            onOpenGeneralRubric={() => setIsRubricOpen(true)}
          />
        )}

        {activeView === 'modeA' && selectedTopic && (
          <SpeechCoach
            topic={selectedTopic}
            onBack={handleGoHome}
          />
        )}

        {activeView === 'modeB' && selectedTopic && (
          <AudioRecorderUI
            topic={selectedTopic}
            onBack={handleGoHome}
          />
        )}

        {activeView === 'dashboard' && (
          <DashboardUI
            onBack={handleGoHome}
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
