const AI_KEY = 'nihongo-pocket-gemini-key'
const AI_MODEL_KEY = 'nihongo-pocket-gemini-model'
export const AI_KEY_CHANGED_EVENT = 'nihongo-pocket-ai-key-changed'
const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta'

class GeminiApiError extends Error {
  constructor(message: string, readonly status: number) { super(message) }
}

export interface GeneratedExample { situation: string; jp: string; reading: string; ko: string }
export interface GeneratedExamples { reading: string; examples: GeneratedExample[] }

export function hasAiKey(): boolean {
  return !!localStorage.getItem(AI_KEY)?.trim()
}

export function loadAiModel(): string {
  return localStorage.getItem(AI_MODEL_KEY)?.trim() ?? ''
}

export function saveAiKey(key: string, model = '') {
  const clean = key.trim()
  if (clean) {
    localStorage.setItem(AI_KEY, clean)
    if (model) localStorage.setItem(AI_MODEL_KEY, model)
    else localStorage.removeItem(AI_MODEL_KEY)
  } else {
    localStorage.removeItem(AI_KEY)
    localStorage.removeItem(AI_MODEL_KEY)
  }
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
  if (response.status === 400) throw new GeminiApiError(`Gemini 요청 오류${googleMessage ? `: ${googleMessage}` : ''}`, response.status)
  if (response.status === 401 || response.status === 403) throw new GeminiApiError('API 키 또는 Gemini API 사용 권한을 확인해 주세요', response.status)
  if (response.status === 404) throw new GeminiApiError(`사용할 Gemini 모델을 찾지 못했어요${googleMessage ? `: ${googleMessage}` : ''}`, response.status)
  if (response.status === 429) throw new GeminiApiError('Gemini 사용 한도를 잠시 초과했어요. 조금 뒤 다시 시도해 주세요', response.status)
  if (response.status >= 500) throw new GeminiApiError('Gemini 서버가 잠시 응답하지 않아요. 잠시 뒤 다시 시도해 주세요', response.status)
  throw new GeminiApiError(`Gemini 오류 (${response.status})${googleMessage ? `: ${googleMessage}` : ''}`, response.status)
}

export async function testAiKey(key: string): Promise<string> {
  const clean = key.trim()
  if (!clean) throw new Error('API 키를 입력해 주세요')
  const models = await findAvailableModels(clean)
  if (!models.length) throw new Error('이 API 키로 사용할 수 있는 Gemini 모델이 없어요')
  return models[0]
}

async function findAvailableModels(key: string): Promise<string[]> {
  const data = await gemini('models?pageSize=1000', key) as {
    models?: { name?: string; supportedGenerationMethods?: string[] }[]
  }
  const available = (data.models ?? []).filter(model =>
    model.name?.startsWith('models/gemini-') &&
    !/(image|tts|live)/i.test(model.name)
  )
  const preferred = [
    'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash',
    'gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'
  ]
  const names = available.map(model => model.name!.replace(/^models\//, ''))
  return [...new Set([
    ...preferred,
    ...names.filter(name => name.includes('flash') && !name.includes('preview')),
    ...names.filter(name => !name.includes('preview')),
    ...names
  ])]
}

export async function generateExamples(input: { jp: string; reading: string; meaning: string }): Promise<GeneratedExamples> {
  const key = localStorage.getItem(AI_KEY)?.trim()
  if (!key) throw new Error('설정에서 Gemini API 키를 먼저 저장해 주세요')
  const models = await findAvailableModels(key)
  if (!models.length) throw new Error('이 API 키로 사용할 수 있는 Gemini 모델이 없어요')
  const prompt = `일본어 학습 단어에 대해 실제 일상에서 자연스럽게 쓰는 짧은 예문 3개를 만드세요.
단어: ${input.jp}
읽기: ${input.reading || '(모름)'}
한국어 뜻: ${input.meaning}

세 예문은 서로 다른 상황이어야 하며, 초급 학습자가 이해할 수 있어야 합니다. reading에는 단어의 정확한 히라가나 읽기를 넣으세요.
각 예문의 reading에는 문장 전체를 한자 없이 히라가나로 적으세요.
다음 형태의 JSON 객체만 반환하세요:
{"reading":"단어의 히라가나","examples":[{"situation":"짧은 상황","jp":"일본어 예문","reading":"문장 전체의 히라가나","ko":"한국어 번역"},{"situation":"짧은 상황","jp":"일본어 예문","reading":"문장 전체의 히라가나","ko":"한국어 번역"},{"situation":"짧은 상황","jp":"일본어 예문","reading":"문장 전체의 히라가나","ko":"한국어 번역"}]}`
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 1000, responseMimeType: 'application/json' }
  })
  let data: any
  let lastError: unknown
  for (const model of models.slice(0, 12)) {
    try {
      data = await gemini(`models/${model}:generateContent`, key, { method: 'POST', body })
      localStorage.setItem(AI_MODEL_KEY, model)
      break
    } catch (error) {
      lastError = error
      if (!(error instanceof GeminiApiError) || ![400, 404].includes(error.status)) throw error
    }
  }
  if (!data) throw lastError ?? new Error('사용 가능한 Gemini 생성 모델을 찾지 못했어요')
  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('')
  if (!text) throw new Error('Gemini가 예문을 만들지 못했어요. 다시 시도해 주세요')
  let result: GeneratedExamples
  try { result = JSON.parse(text) } catch { throw new Error('Gemini 응답을 읽지 못했어요. 다시 시도해 주세요') }
  if (!Array.isArray(result.examples) || result.examples.length !== 3) throw new Error('예문 응답이 올바르지 않아요')
  return result
}
