import { db } from './db'
import { newCard, reviveCard, type Card } from './srs'
import type { Settings, Word } from './types'

export function uid(): string {
  return 'w-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
}

export interface WordInput {
  jp: string
  reading?: string
  meaning: string
  category?: string
  polite?: string
  example?: string
}

export function makeWord(input: WordInput, extra?: Partial<Word>): Word {
  const card = extra?.card ? reviveCard(extra.card) : newCard()
  return {
    id: extra?.id ?? uid(),
    jp: input.jp.trim(),
    reading: input.reading?.trim() ?? '',
    meaning: input.meaning.trim(),
    category: input.category?.trim() || '기타',
    polite: input.polite?.trim() ?? '',
    example: input.example?.trim() ?? '',
    fav: extra?.fav ?? 0,
    createdAt: extra?.createdAt ?? Date.now(),
    card,
    due: card.due.getTime(),
    state: card.state
  }
}

/** 카드(FSRS 상태)를 교체하면서 인덱스 미러 필드도 갱신 */
export function withCard(word: Word, card: Card): Word {
  return { ...word, card, due: card.due.getTime(), state: card.state }
}

// ---- 설정 ----
const SETTINGS_KEY = 'nihongo-pocket-settings'
const defaultSettings: Settings = { newPerDay: 10, mode: 'jp-ko' }

export function loadSettings(): Settings {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }
  } catch {
    return { ...defaultSettings }
  }
}
export function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

// ---- 오늘 새로 학습한 단어 수 (신규 카드 일일 제한용) ----
const DAILY_KEY = 'nihongo-pocket-daily'

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
export function introducedToday(): number {
  try {
    const data = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}')
    return data.date === todayStr() ? data.count || 0 : 0
  } catch {
    return 0
  }
}
export function bumpIntroducedToday() {
  localStorage.setItem(DAILY_KEY, JSON.stringify({ date: todayStr(), count: introducedToday() + 1 }))
}

// ---- 백업 / 복원 ----
export function exportJSON(words: Word[]): string {
  return JSON.stringify(
    { app: 'Nihongo Pocket', version: 2, exportedAt: new Date().toISOString(), words },
    null,
    2
  )
}

interface V1Word {
  jp: string; reading?: string; meaning: string; category?: string
  polite?: string; example?: string; fav?: boolean; createdAt?: number
}

/** v2 백업과 v1(구버전 단일 파일 앱) 백업 모두 지원 */
export function parseBackup(text: string): Word[] {
  const data = JSON.parse(text)
  if (!Array.isArray(data.words)) throw new Error('invalid backup')
  if (data.version === 2) {
    return (data.words as Word[]).map(w => withCard(w, reviveCard(w.card)))
  }
  return (data.words as V1Word[]).map(w =>
    makeWord(w, { fav: w.fav ? 1 : 0, createdAt: w.createdAt })
  )
}

/** 같은 도메인에 배포됐던 구버전 앱의 localStorage 데이터를 자동으로 가져옴 */
export async function migrateFromV1(): Promise<number> {
  const raw = localStorage.getItem('nihongo-pocket-v1')
  if (!raw) return 0
  try {
    const data = JSON.parse(raw)
    if (!Array.isArray(data.words) || !data.words.length) return 0
    const words = (data.words as V1Word[]).map(w =>
      makeWord(w, { fav: w.fav ? 1 : 0, createdAt: w.createdAt })
    )
    await db.words.bulkPut(words)
    localStorage.setItem('nihongo-pocket-v1-migrated', new Date().toISOString())
    localStorage.removeItem('nihongo-pocket-v1')
    return words.length
  } catch {
    return 0
  }
}
