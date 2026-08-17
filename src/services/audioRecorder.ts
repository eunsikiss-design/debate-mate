export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  durationSeconds: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private timerId: any = null;
  private elapsedSeconds: number = 0;

  private onStateChangeCb: ((state: AudioRecorderState) => void) | null = null;

  public async startRecording(
    canvasEl?: HTMLCanvasElement | null,
    onStateChange?: (state: AudioRecorderState) => void
  ): Promise<boolean> {
    this.onStateChangeCb = onStateChange || null;
    this.audioChunks = [];
    this.elapsedSeconds = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
        else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else mimeType = '';
      }

      const options = mimeType ? { mimeType, audioBitsPerSecond: 48000 } : {};
      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        this.notifyState({
          isRecording: false,
          isPaused: false,
          durationSeconds: this.elapsedSeconds,
          audioBlob: blob,
          audioUrl: url
        });
        this.stopVisualizer();
        this.stopTimer();
      };

      if (canvasEl) {
        this.setupVisualizer(stream, canvasEl);
      }

      this.mediaRecorder.start(1000);
      this.startTimer();

      this.notifyState({
        isRecording: true,
        isPaused: false,
        durationSeconds: 0,
        audioBlob: null,
        audioUrl: null
      });

      return true;
    } catch (err) {
      console.error('AudioRecorder permission or setup error:', err);
      return false;
    }
  }

  public pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.stopTimer();
      this.notifyState({
        isRecording: true,
        isPaused: true,
        durationSeconds: this.elapsedSeconds,
        audioBlob: null,
        audioUrl: null
      });
    }
  }

  public resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.startTimer();
      this.notifyState({
        isRecording: true,
        isPaused: false,
        durationSeconds: this.elapsedSeconds,
        audioBlob: null,
        audioUrl: null
      });
    }
  }

  public stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerId = setInterval(() => {
      this.elapsedSeconds++;
      if (this.onStateChangeCb && this.mediaRecorder) {
        this.onStateChangeCb({
          isRecording: this.mediaRecorder.state === 'recording',
          isPaused: this.mediaRecorder.state === 'paused',
          durationSeconds: this.elapsedSeconds,
          audioBlob: null,
          audioUrl: null
        });
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private setupVisualizer(stream: MediaStream, canvas: HTMLCanvasElement): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        this.animFrameId = requestAnimationFrame(draw);
        if (!this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;

          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#0ea5e9');
          gradient.addColorStop(1, '#10b981');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.warn('Canvas visualizer setup warning:', e);
    }
  }

  private stopVisualizer(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private notifyState(state: AudioRecorderState): void {
    if (this.onStateChangeCb) {
      this.onStateChangeCb(state);
    }
  }
}

export const audioRecorderService = new AudioRecorderService();
