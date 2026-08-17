import type { Topic, RubricResult, OreoData } from '../types';
import { StorageService } from './storageService';

export class GeminiService {
  private static getEffectiveApiKey(): string {
    const settings = StorageService.getSettings();
    const userKey = settings.geminiApiKey?.trim();
    if (userKey) return userKey;

    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY?.trim();
    if (envKey) return envKey;

    return '';
  }

  public static isApiKeyConfigured(): boolean {
    return this.getEffectiveApiKey().length > 0;
  }

  // --- Mode A: Real-time 1:1 Counter Argument Generation ---
  public static async generateModeACounterArgument(
    topic: Topic,
    userSpeech: string,
    oreoData?: OreoData | null
  ): Promise<string> {
    const apiKey = this.getEffectiveApiKey();
    const settings = StorageService.getSettings();
    const model = settings.geminiModel || 'gemini-1.5-flash';

    const systemPrompt = `당신은 고등학교 통합사회 토론 코치입니다.
사용자(학생)가 발화한 텍스트와 선택된 [토론 논제]를 바탕으로 대화를 이어가세요.

[작성 규칙]:
1. 학생의 발화에서 논리적으로 잘한 점(주장 명확성, 근거 적절성 등)을 1문장으로 칭찬/공감하세요.
2. 교과서 쟁점 및 키워드를 바탕으로 논리적 빈틈을 찌르는 반론 질문을 1문장으로 제시하세요.
3. 전체 답변은 3문장을 넘지 않게 매우 간결하고 대화체로 작성하세요.
4. 부드럽고 격려하는 어조의 존댓말을 사용하세요.`;

    let cueContext = '';
    if (oreoData && (oreoData.opinion || oreoData.reason)) {
      cueContext = `\n[학생의 사전 OREO 큐카드 정보]:
- 주장: ${oreoData.opinion}
- 이유: ${oreoData.reason}
- 사례: ${oreoData.example}
- 재주장: ${oreoData.opinion2}`;
    }

    const userPrompt = `[토론 논제]: ${topic.title}
[핵심 키워드]: ${topic.keywords.join(', ')}
${cueContext}
[학생의 최신 발화]: "${userSpeech}"`;

    if (!apiKey) {
      return this.generateSimulatedModeAResponse(topic, userSpeech);
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 256,
            temperature: 0.7
          }
        })
      });

      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }

      const json = await res.json();
      const reply = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply.trim();
      throw new Error('Empty response from Gemini API');
    } catch (err) {
      console.warn('Gemini API call failed, using fallback coach response:', err);
      return this.generateSimulatedModeAResponse(topic, userSpeech);
    }
  }

  // Fallback Mode A coach response simulator
  private static generateSimulatedModeAResponse(topic: Topic, userSpeech: string): string {
    const kw2 = topic.keywords[1] || '관련 쟁점';
    const matchedKw = topic.keywords.find(k => userSpeech.includes(k)) || '주장의 논리';
    return `발언하신 내용에서 "${matchedKw}"에 대한 입장을 명확히 해주셔서 돋보였습니다! 하지만 "${kw2}" 관점에서 예상되는 부작용이나 상충되는 기본권은 어떻게 해결할 수 있을까요? 이 점을 보완하여 재반론해보세요.`;
  }

  // --- Mode B: Multimodal Audio Rubric Evaluation ---
  public static async evaluateAudioRubric(
    topic: Topic,
    audioBlob: Blob | null,
    audioUrl?: string | null
  ): Promise<RubricResult> {
    const apiKey = this.getEffectiveApiKey();
    const settings = StorageService.getSettings();
    const model = settings.geminiModel || 'gemini-1.5-flash';

    const systemPrompt = `당신은 고등학교 통합사회 전문 평가관입니다.
제공된 토론 오디오 파일(찬성/반대 양측 발언 포함)을 분석하여 아래 루브릭에 따라 공정하게 평가하고 JSON 포맷으로 출력하세요.

[토론 논제]: ${topic.title}
[과업 특수 루브릭]:
- A (상): ${topic.task_rubric.A}
- B (중): ${topic.task_rubric.B}
- C (하): ${topic.task_rubric.C}
[일반 루브릭]:
- 주장의 타당성(A/B/C): 교과 개념 및 근거의 타당성
- 반론 및 교차조사(A/B/C): 상대 논점 파악 및 재반론 완성도
- 자료 활용(A/B/C): 통계, 법률, 사상가 이론 인용 적절성
- 토론 태도(A/B/C): 시간 배분 및 경청/존중 태도

반드시 유효한 JSON만 반환하세요.`;

    if (!apiKey || !audioBlob) {
      await new Promise(r => setTimeout(r, 1800));
      return this.generateSimulatedRubricResult(topic, audioUrl || undefined);
    }

    try {
      const base64Audio = await this.blobToBase64(audioBlob);
      const mimeType = audioBlob.type || 'audio/webm';

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Audio
                  }
                },
                {
                  text: `위 토론 녹음 오디오를 청취하고 화자를 분리하여 찬성측과 반대측을 각각 평가한 JSON을 생성해주세요.`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini Multimodal API HTTP ${response.status}`);
      }

      const jsonResp = await response.json();
      const rawText = jsonResp.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty evaluation output');

      const cleanedJson = rawText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
      const parsed: RubricResult = JSON.parse(cleanedJson);
      if (audioUrl) parsed.audioUrl = audioUrl;
      return parsed;

    } catch (err) {
      console.warn('Multimodal evaluation error, falling back to simulated rubric:', err);
      return this.generateSimulatedRubricResult(topic, audioUrl || undefined);
    }
  }

  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  public static generateSimulatedRubricResult(topic: Topic, audioUrl?: string): RubricResult {
    const k1 = topic.keywords[0] || '핵심 교과 개념';
    const k2 = topic.keywords[1] || '관련 이론';
    const k3 = topic.keywords[2] || '실제 사례';

    return {
      summary: `[${topic.unit}] "${topic.title}" 논제에 대해 찬성측과 반대측 모두 교과서 주요 쟁점을 충실히 다루며 열띤 입론과 교차조사를 진행함. 특히 '${k1}'과 '${k2}' 개념의 적용도가 돋보였음.`,
      audioUrl,
      affirmative: {
        grades: {
          argumentation: 'A',
          rebuttal: 'A',
          evidence: 'B',
          attitude: 'A'
        },
        task_grade: 'A',
        strengths: [
          `"${k1}" 관점을 적용하여 논제의 필요성과 타당성을 구체적인 근거와 연결하여 유기적으로 입론함.`,
          '상대측의 질문에 당황하지 않고 경청하는 자세를 유지하며 민주적 발언 시간을 엄수함.'
        ],
        improvements: [
          `구체적인 통계 자료나 사상가 이론(${k2}) 인용을 보완하면 논증의 신뢰도가 더 높아집니다.`,
          `상대측의 '${k3}' 반론에 대한 다각도 재반론 논거 준비가 추천됩니다.`
        ],
        concept_usage: `'${k1}' 개념을 정확히 이해하고 입론의 중심 축으로 활용함. '${k2}'과의 연결 시도가 적절했음.`
      },
      negative: {
        grades: {
          argumentation: 'B',
          rebuttal: 'A',
          evidence: 'B',
          attitude: 'A'
        },
        task_grade: 'B',
        strengths: [
          `상대측 입론의 논리적 맹점을 정확히 짚어 정곡을 찌르는 반론 질문을 제시함.`,
          '토론 매너가 우수하며 상대발언을 끝까지 듣고 상호 존중하는 정중한 어조를 유지함.'
        ],
        improvements: [
          `반론에 그치지 않고 반대측 고유의 대체 대안 및 법적/윤리적 정당성을 심층적으로 전개할 필요가 있습니다.`,
          `'${k3}' 관점의 역차별 및 부작용 사례를 더 체계적으로 제시하는 것이 좋습니다.`
        ],
        concept_usage: `'${k3}' 개념을 통해 부작용을 지적했으나, '${k2}' 이론의 깊이 있는 비교 분석이 다소 단편적이었음.`
      }
    };
  }
}
