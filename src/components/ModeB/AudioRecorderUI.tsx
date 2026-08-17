import React, { useState, useRef } from 'react';
import { Mic, Pause, Play, Square, Sparkles, ArrowLeft, RefreshCw, Music } from 'lucide-react';
import type { Topic, RubricResult } from '../../types';
import { audioRecorderService } from '../../services/audioRecorder';
import type { AudioRecorderState } from '../../services/audioRecorder';
import { GeminiService } from '../../services/geminiService';
import { RubricReportUI } from './RubricReportUI';

interface AudioRecorderUIProps {
  topic: Topic;
  onBack: () => void;
}

export const AudioRecorderUI: React.FC<AudioRecorderUIProps> = ({ topic, onBack }) => {
  const [recorderState, setRecorderState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    durationSeconds: 0,
    audioBlob: null,
    audioUrl: null
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<RubricResult | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    setEvaluationResult(null);
    await audioRecorderService.startRecording(canvasRef.current, setRecorderState);
  };

  const handlePause = () => audioRecorderService.pauseRecording();
  const handleResume = () => audioRecorderService.resumeRecording();
  const handleStop = () => audioRecorderService.stopRecording();

  const handleRunEvaluation = async () => {
    if (!recorderState.audioBlob && !recorderState.audioUrl) return;
    setIsEvaluating(true);
    try {
      const result = await GeminiService.evaluateAudioRubric(
        topic,
        recorderState.audioBlob,
        recorderState.audioUrl
      );
      setEvaluationResult(result);
    } catch (err) {
      console.error('Audio evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (evaluationResult) {
    return (
      <RubricReportUI
        topic={topic}
        result={evaluationResult}
        audioUrl={recorderState.audioUrl}
        onReset={() => {
          setEvaluationResult(null);
          setRecorderState({
            isRecording: false,
            isPaused: false,
            durationSeconds: 0,
            audioBlob: null,
            audioUrl: null
          });
        }}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] font-bold rounded-md">
                모드 B: 실전 토론 녹음
              </span>
              <span className="text-xs text-slate-400 font-mono">{topic.unit}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
              {topic.title}
            </h2>
          </div>
        </div>
      </div>

      {/* Main Recording Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
        {/* Topic Guide */}
        <div className="bg-slate-850 border border-slate-700/80 p-4 rounded-2xl text-left space-y-2">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>실전 오디오 녹음 및 자동 채점 안내</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            찬성측과 반대측의 입론, 반론 및 자유토론 전체 발언을 녹음하세요.
            <br />
            `audio/webm;codecs=opus` 형식으로 실시간 고효율 압축되며, 멀티모달 Gemini AI가 화자를 분리하여 5가지 다차원 루브릭(A/B/C)을 자동 채점합니다.
          </p>
        </div>

        {/* Timer Display */}
        <div className="space-y-1">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-wider font-mono bg-gradient-to-r from-teal-300 via-sky-200 to-white bg-clip-text text-transparent">
            {formatTimer(recorderState.durationSeconds)}
          </div>
          <div className="text-xs text-slate-400">
            {recorderState.isRecording
              ? recorderState.isPaused
                ? '일시정지 됨'
                : '녹음 진행 중 (Screen WakeLock 작동)'
              : recorderState.audioUrl
              ? '녹음 완료됨'
              : '녹음 대기 중'}
          </div>
        </div>

        {/* Canvas Visualizer */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl h-28 overflow-hidden relative flex items-center justify-center p-2">
          <canvas
            ref={canvasRef}
            width={600}
            height={100}
            className="w-full h-full object-cover"
          />
          {!recorderState.isRecording && !recorderState.audioUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs gap-1 font-semibold">
              <Music className="w-4 h-4" /> 오디오 녹음을 시작하면 음성 파형이 표시됩니다
            </div>
          )}
        </div>

        {/* Audio Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {!recorderState.isRecording && !recorderState.audioUrl && (
            <button
              onClick={handleStart}
              className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 rounded-2xl font-bold text-white text-sm shadow-lg shadow-teal-500/25 flex items-center gap-2 transition-all scale-105"
            >
              <Mic className="w-5 h-5" /> 녹음 시작하기
            </button>
          )}

          {recorderState.isRecording && (
            <>
              {recorderState.isPaused ? (
                <button
                  onClick={handleResume}
                  className="px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-4 h-4" /> 재개
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Pause className="w-4 h-4" /> 일시정지
                </button>
              )}

              <button
                onClick={handleStop}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Square className="w-4 h-4 fill-white" /> 녹음 종료 및 저장
              </button>
            </>
          )}
        </div>

        {/* Completed Audio Preview & Run Evaluation */}
        {recorderState.audioUrl && !recorderState.isRecording && (
          <div className="bg-slate-850 border border-slate-700/80 p-5 rounded-2xl space-y-4 animate-fade-in text-left">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-teal-300 flex items-center gap-1.5">
                <Music className="w-4 h-4" /> 녹음본 다시 듣기
              </span>
              <button
                onClick={handleStart}
                className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 다시 녹음
              </button>
            </div>

            <audio controls src={recorderState.audioUrl} className="w-full h-10 rounded-lg" />

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleRunEvaluation}
                disabled={isEvaluating}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-teal-500 via-sky-500 to-emerald-500 hover:opacity-90 rounded-2xl font-extrabold text-sm text-white shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Gemini 멀티모달 오디오 루브릭 채점 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>AI 멀티모달 루브릭 채점 및 리포트 생성</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
