const AI_KEY = 'nihongo-pocket-gemini-key'
export const AI_KEY_CHANGED_EVENT = 'nihongo-pocket-ai-key-changed'
export const GEMINI_MODEL = 'gemini-2.5-flash'
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
  let response: Response
  try {
    response = await fetch(`${API_ROOT}/${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key, ...init?.headers }
    })
  } catch {
    throw new Error('인터넷 또는 브라우저 차단으로 Gemini에 접속하지 못했어요')
  }
  if (response.ok) return response.json()
  const detail = await response.json().catch(() => null) as { error?: { message?: string } } | null
  const googleMessage = detail?.error?.message?.replace(/\s+/g, ' ').trim()
  if (response.status === 400) throw new Error(`Gemini 요청 오류${googleMessage ? `: ${googleMessage}` : ''}`)
  if (response.status === 401 || response.status === 403) throw new Error('API 키 또는 Gemini API 사용 권한을 확인해 주세요')
  if (response.status === 404) throw new Error('사용할 Gemini 모델을 찾지 못했어요')
  if (response.status === 429) throw new Error('Gemini 사용 한도를 잠시 초과했어요. 조금 뒤 다시 시도해 주세요')
  if (response.status >= 500) throw new Error('Gemini 서버가 잠시 응답하지 않아요. 잠시 뒤 다시 시도해 주세요')
  throw new Error(`Gemini 오류 (${response.status})${googleMessage ? `: ${googleMessage}` : ''}`)
}

export async function testAiKey(key: string): Promise<string> {
  const clean = key.trim()
  if (!clean) throw new Error('API 키를 입력해 주세요')
  await gemini(`models/${GEMINI_MODEL}`, clean)
  return GEMINI_MODEL
}

export async function generateExamples(input: { jp: string; reading: string; meaning: string }): Promise<GeneratedExamples> {
  const key = localStorage.getItem(AI_KEY)?.trim()
  if (!key) throw new Error('설정에서 Gemini API 키를 먼저 저장해 주세요')
  const prompt = `일본어 학습 단어에 대해 실제 일상에서 자연스럽게 쓰는 짧은 예문 3개를 만드세요.
단어: ${input.jp}
읽기: ${input.reading || '(모름)'}
한국어 뜻: ${input.meaning}

세 예문은 서로 다른 상황이어야 하며, 초급 학습자가 이해할 수 있어야 합니다. reading에는 단어의 정확한 히라가나 읽기를 넣으세요.
다음 형태의 JSON 객체만 반환하세요:
{"reading":"히라가나","examples":[{"situation":"짧은 상황","jp":"일본어 예문","ko":"한국어 번역"},{"situation":"짧은 상황","jp":"일본어 예문","ko":"한국어 번역"},{"situation":"짧은 상황","jp":"일본어 예문","ko":"한국어 번역"}]}`
  const data = await gemini(`models/${GEMINI_MODEL}:generateContent`, key, {
    method: 'POST',
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4, maxOutputTokens: 1000, responseMimeType: 'application/json'
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
