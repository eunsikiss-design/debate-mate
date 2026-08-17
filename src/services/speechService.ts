// Web Speech API STT and TTS Service

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const FILLER_WORDS = ['어', '음', '그', '아', '저', '있잖아요', '약간', '어...', '음...', '그...'];

export class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private startTime: number = 0;
  private ttsVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initRecognition();
    this.initTTS();
  }

  private initRecognition(): void {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'ko-KR';
    } else {
      console.warn('Web Speech Recognition API is not supported in this browser.');
    }
  }

  private initTTS(): void {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        this.ttsVoices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('ko'));
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  public isSTTSupported(): boolean {
    return this.recognition !== null;
  }

  public startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (err: any) => void
  ): void {
    if (!this.recognition) {
      if (onError) onError('STT_NOT_SUPPORTED');
      return;
    }

    this.startTime = Date.now();
    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript, true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event.error);
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start caught error:', e);
    }
  }

  public stopListening(): number {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Recognition stop error:', e);
      }
      this.isListening = false;
    }
    const durationSeconds = Math.max(1, (Date.now() - this.startTime) / 1000);
    return durationSeconds;
  }

  // --- TTS Speak ---
  public speak(text: string, onEnd?: () => void): void {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const koreanVoice = this.ttsVoices.find(v => v.lang === 'ko-KR') || this.ttsVoices[0];
    if (koreanVoice) utterance.voice = koreanVoice;

    if (onEnd) utterance.onend = onEnd;

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // --- Speech Coaching Analytics ---
  public static calculateWPM(text: string, durationSeconds: number): number {
    if (durationSeconds <= 0 || !text.trim()) return 0;
    const words = text.trim().split(/\s+/).length;
    const wpm = Math.round((words / durationSeconds) * 60);
    return Math.min(300, Math.max(10, wpm));
  }

  public static detectFillerWords(text: string): { count: number; words: string[] } {
    let count = 0;
    const found: string[] = [];

    FILLER_WORDS.forEach(filler => {
      const regex = new RegExp(filler.replace('.', '\\.'), 'g');
      const matches = text.match(regex);
      if (matches) {
        count += matches.length;
        found.push(...matches);
      }
    });

    return { count, words: found };
  }

  public static checkKeywordHighlights(text: string, keywords: string[]): string[] {
    const matched: string[] = [];
    keywords.forEach(kw => {
      if (text.includes(kw) || kw.split(' ').some(part => part.length > 1 && text.includes(part))) {
        matched.push(kw);
      }
    });
    return matched;
  }
}

export const speechService = new SpeechService();
