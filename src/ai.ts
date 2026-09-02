const AI_KEY = 'nihongo-pocket-gemini-key'
export const AI_KEY_CHANGED_EVENT = 'nihongo-pocket-ai-key-changed'
const MODEL = 'gemini-2.5-flash'
const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta'

export interface GeneratedExample { situation: string; jp: string; ko: string }
export interface GeneratedExamples { reading: string; examples: GeneratedExample[] }

export function hasAiKey(): boolean {
  return !!localStorage.getItem(AI_KEY)?.trim()
}

export function saveAiKey(key: string) {
  const clean = key.trim()
  if (clean) localStorage.setItem(AI_KEY, clean)
  else localStorage.removeItem(AI_KEY)
  window.dispatchEvent(new Event(AI_KEY_CHANGED_EVENT))
}

async function gemini(path: string, key: string, init?: RequestInit) {
  const response = await fetch(`${API_ROOT}/${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key, ...init?.headers }
  })
  if (response.ok) return response.json()
  if (response.status === 400 || response.status === 403) throw new Error('API 키가 올바른지 확인해 주세요')
  if (response.status === 429) throw new Error('Gemini 사용 한도를 잠시 초과했어요. 조금 뒤 다시 시도해 주세요')
  throw new Error('Gemini에 연결하지 못했어요')
}

export async function testAiKey(key: string): Promise<string> {
  const clean = key.trim()
  if (!clean) throw new Error('API 키를 입력해 주세요')
  await gemini(`models/${MODEL}`, clean)
  return MODEL
}

export async function generateExamples(input: { jp: string; reading: string; meaning: string }): Promise<GeneratedExamples> {
  const key = localStorage.getItem(AI_KEY)?.trim()
  if (!key) throw new Error('설정에서 Gemini API 키를 먼저 저장해 주세요')
  const prompt = `일본어 학습 단어에 대해 실제 일상에서 자연스럽게 쓰는 짧은 예문 3개를 만드세요.
단어: ${input.jp}
읽기: ${input.reading || '(모름)'}
한국어 뜻: ${input.meaning}

세 예문은 서로 다른 상황이어야 하며, 초급 학습자가 이해할 수 있어야 합니다. reading에는 단어의 정확한 히라가나 읽기를 넣으세요.`
  const data = await gemini(`models/${MODEL}:generateContent`, key, {
    method: 'POST',
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4, maxOutputTokens: 1000, responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT', required: ['reading', 'examples'],
          properties: {
            reading: { type: 'STRING' },
            examples: {
              type: 'ARRAY', minItems: 3, maxItems: 3,
              items: { type: 'OBJECT', required: ['situation', 'jp', 'ko'], properties: {
                situation: { type: 'STRING' }, jp: { type: 'STRING' }, ko: { type: 'STRING' }
              } }
            }
          }
        }
      }
    })
  })
  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('')
  if (!text) throw new Error('Gemini가 예문을 만들지 못했어요. 다시 시도해 주세요')
  let result: GeneratedExamples
  try { result = JSON.parse(text) } catch { throw new Error('Gemini 응답을 읽지 못했어요. 다시 시도해 주세요') }
  if (!Array.isArray(result.examples) || result.examples.length !== 3) throw new Error('예문 응답이 올바르지 않아요')
  return result
}
