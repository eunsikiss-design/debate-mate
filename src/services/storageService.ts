import type { AppSettings, SavedEvaluationRecord } from '../types';

const SETTINGS_KEY = 'debate_mate_settings';
const RECORDS_KEY = 'debate_mate_records';
const QUEUE_KEY = 'debate_mate_offline_queue';

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-1.5-flash',
  googleSheetsUrl: '',
  studentIdName: '10101 홍길동',
  teamName: '1모둠'
};

export class StorageService {
  // --- Settings ---
  public static getSettings(): AppSettings {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  // --- Saved Evaluation Records ---
  public static getRecords(): SavedEvaluationRecord[] {
    const data = localStorage.getItem(RECORDS_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static saveRecord(record: SavedEvaluationRecord): void {
    const records = this.getRecords();
    records.unshift(record);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    // Try transmitting to Google Sheets
    this.sendToGoogleSheets(record);
  }

  public static deleteRecord(id: string): void {
    const records = this.getRecords().filter(r => r.id !== id);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }

  // --- Google Sheets Sync & Offline Queue ---
  public static async sendToGoogleSheets(record: SavedEvaluationRecord): Promise<boolean> {
    const settings = this.getSettings();
    if (!settings.googleSheetsUrl) {
      console.log('Google Sheets Webhook URL is not set. Saved locally only.');
      return false;
    }

    const payload = {
      timestamp: record.timestamp,
      studentIdName: record.studentIdName,
      teamName: record.teamName,
      topicId: record.topicId,
      affSummaryGrade: record.affSummaryGrade,
      negSummaryGrade: record.negSummaryGrade,
      detailFeedbackSummary: record.detailFeedbackSummary,
      audioUrl: record.audioUrl
    };

    try {
      const res = await fetch(settings.googleSheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        console.log('Successfully synced row to Google Sheets!');
        return true;
      } else {
        throw new Error(`HTTP error ${res.status}`);
      }
    } catch (err) {
      console.warn('Network error or invalid Sheets URL. Enqueuing for offline retry.', err);
      this.enqueueOfflineRecord(record);
      return false;
    }
  }

  private static enqueueOfflineRecord(record: SavedEvaluationRecord): void {
    const queue = this.getOfflineQueue();
    if (!queue.some(q => q.id === record.id)) {
      queue.push(record);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }
  }

  public static getOfflineQueue(): SavedEvaluationRecord[] {
    const data = localStorage.getItem(QUEUE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static async processOfflineQueue(): Promise<number> {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return 0;
    const remaining: SavedEvaluationRecord[] = [];
    let syncedCount = 0;

    for (const record of queue) {
      const success = await this.sendToGoogleSheets(record);
      if (success) {
        syncedCount++;
      } else {
        remaining.push(record);
      }
    }

    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    return syncedCount;
  }

  // --- Export Helpers ---
  public static exportToCSV(records: SavedEvaluationRecord[]): void {
    const headers = ['Timestamp', '학번/이름', '모둠명', '논제 ID', '찬성측 등급', '반대측 등급', '상세 피드백', '오디오 링크'];
    const rows = records.map(r => [
      `"${r.timestamp}"`,
      `"${r.studentIdName}"`,
      `"${r.teamName}"`,
      `"${r.topicId}"`,
      `"${r.affSummaryGrade}"`,
      `"${r.negSummaryGrade}"`,
      `"${r.detailFeedbackSummary.replace(/"/g, '""')}"`,
      `"${r.audioUrl}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Debate_Mate_Results_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }
}
