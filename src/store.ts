import { db } from './db'
import { newCard, reviveCard, type Card } from './srs'
import type { SavedExample, Settings, Word } from './types'

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
  examples?: SavedExample[]
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
    examples: input.examples ?? extra?.examples ?? [],
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
const defaultSettings: Settings = { theme: 'dark', newPerDay: 10, mode: 'jp-ko', hideMeaning: false, hideWord: false, autoSpeak: true, speakRate: 0.9, jpFont: 'serif' }

export function loadSettings(): Settings {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }
  } catch {
    return { ...defaultSettings }
  }
}
export function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  applyJpFont(s.jpFont)
  applyTheme(s.theme)
}

/** 일본어 글꼴을 문서 전체에 반영 */
export function applyJpFont(font: Settings['jpFont']) {
  document.documentElement.dataset.jpfont = font
}

/** 화면 테마와 브라우저 UI 색상을 즉시 반영 */
export function applyTheme(theme: Settings['theme']) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content', theme === 'dark' ? '#101115' : '#F4F1E9'
  )
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
/** withProgress=false면 학습 진도를 빼고 단어 내용만 담는다 (공유용) */
export function exportJSON(words: Word[], withProgress = true): string {
  const list = withProgress
    ? words
    : words.map(({ jp, reading, meaning, category, polite, example, examples }) =>
        ({ jp, reading, meaning, category, polite, example, examples }))
  return JSON.stringify(
    { app: 'Nihongo Pocket', version: 2, exportedAt: new Date().toISOString(), words: list },
    null,
    2
  )
}

/** 이미 있는 단어(같은 표기)는 건너뛰고 새 단어만 추가 */
export async function mergeWords(incoming: Word[]): Promise<{ added: number; skipped: number }> {
  const seen = new Set((await db.words.toArray()).map(w => w.jp))
  const fresh: Word[] = []
  for (const w of incoming) {
    if (!w.jp || seen.has(w.jp)) continue
    seen.add(w.jp)
    fresh.push(w)
  }
  if (fresh.length) await db.words.bulkAdd(fresh)
  return { added: fresh.length, skipped: incoming.length - fresh.length }
}

/** 학습 진도가 아닌, 보내는 쪽이 정하는 내용 */
const CONTENT_FIELDS = ['jp', 'reading', 'meaning', 'category', 'polite', 'example'] as const

/**
 * 보내는 쪽(PC)을 원본으로 보고 맞춘다. 내용은 덮어쓰되 학습 진도와 즐겨찾기는 이 기기 것을 지킨다.
 * 저쪽에서 지운 단어를 여기서 따라 지우지는 않는다.
 */
export async function syncWords(incoming: Word[]): Promise<{ added: number; updated: number }> {
  const byJp = new Map((await db.words.toArray()).map(w => [w.jp, w]))
  const fresh: Word[] = []
  const changed: Word[] = []
  const seen = new Set<string>()

  for (const w of incoming) {
    if (!w.jp || seen.has(w.jp)) continue
    seen.add(w.jp)
    const mine = byJp.get(w.jp)
    if (!mine) { fresh.push(w); continue }
    const next = { ...mine }
    let dirty = false
    for (const f of CONTENT_FIELDS) {
      if (w[f] !== mine[f]) { next[f] = w[f]; dirty = true }
    }
    if (JSON.stringify(w.examples ?? []) !== JSON.stringify(mine.examples ?? [])) {
      next.examples = w.examples ?? []
      dirty = true
    }
    if (dirty) changed.push(next)
  }

  if (fresh.length) await db.words.bulkAdd(fresh)
  if (changed.length) await db.words.bulkPut(changed)
  return { added: fresh.length, updated: changed.length }
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
    // 공유용 파일에는 card가 없어서, 그때는 새 카드로 시작한다
    return (data.words as Word[]).map(w =>
      w.card ? withCard(w, reviveCard(w.card)) : makeWord(w, { fav: w.fav ? 1 : 0, createdAt: w.createdAt })
    )
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
