import type { Word } from './types'

/** 사전 파일은 앱 번들이 아니라 필요할 때 1회 내려받아 서비스워커가 캐시함 */
const DICT_FILE = 'pitch-accents.txt'

export type AccentTarget = Pick<Word, 'id' | 'jp' | 'reading'>

const SMALL_KANA = 'ゃゅょャュョぁぃぅぇぉァィゥェォゎヮ'
const KANJI_RE = /[㐀-鿿々〆]/

/** 가나를 박(모라) 단위로 나눔. 작은 가나는 앞 글자에 붙고 ー・っ・ん은 독립된 박 */
export function moraSplit(kana: string): string[] {
  const out: string[] = []
  for (const ch of kana.trim()) {
    if (SMALL_KANA.includes(ch) && out.length) out[out.length - 1] += ch
    else out.push(ch)
  }
  return out
}

/**
 * 도쿄식 고저 악센트 패턴. true = 높은 박
 * 0 평판형 / 1 두고형 / n 중고·미고형(n번째 박 뒤에서 내려감)
 */
export function pitchHighs(moraCount: number, accent: number): boolean[] {
  const highs: boolean[] = []
  for (let i = 0; i < moraCount; i++) {
    if (accent === 0) highs.push(i > 0)
    else if (accent === 1) highs.push(i === 0)
    else highs.push(i > 0 && i < accent)
  }
  return highs
}

const CIRCLED = '⓪①②③④⑤⑥⑦⑧⑨'
export function circledNum(n: number): string {
  return n >= 0 && n < CIRCLED.length ? CIRCLED[n] : String(n)
}

function parseAccents(field: string): number[] {
  const out: number[] = []
  for (const part of field.split(',')) {
    const n = Number.parseInt(part.trim(), 10)
    if (Number.isFinite(n) && n >= 0 && n < 30 && !out.includes(n)) out.push(n)
  }
  return out
}

let inflight: Promise<string> | null = null

function dictText(): Promise<string> {
  if (!inflight) {
    inflight = fetch(new URL(DICT_FILE, document.baseURI).href)
      .then(r => {
        if (!r.ok) throw new Error('pitch dict HTTP ' + r.status)
        return r.text()
      })
      .catch(err => { inflight = null; throw err })
      // 다음 호출은 서비스워커 캐시에서 바로 오므로 3MB 문자열을 계속 들고 있지 않음
      .finally(() => { queueMicrotask(() => { inflight = null }) })
  }
  return inflight
}

/**
 * 필요한 단어들만 사전을 한 번 훑어서 찾음.
 * 124k줄 전체를 Map으로 올리지 않아 아이폰에서도 메모리 부담이 적음.
 */
export async function lookupAccents(targets: AccentTarget[]): Promise<Map<string, number[]>> {
  const found = new Map<string, number[]>()
  if (!targets.length) return found

  const byWord = new Map<string, AccentTarget[]>()
  // 가나 단어는 사전에 한자 표제어(何処·為る 등)로만 있는 경우가 많아 읽기 칸으로도 찾음
  const byReading = new Map<string, AccentTarget[]>()
  const push = (map: Map<string, AccentTarget[]>, key: string, t: AccentTarget) => {
    const bucket = map.get(key)
    if (bucket) bucket.push(t)
    else map.set(key, [t])
  }
  for (const t of targets) {
    const key = t.jp.trim()
    if (!key) continue
    push(byWord, key, t)
    if (!KANJI_RE.test(key)) push(byReading, t.reading?.trim() || key, t)
  }
  if (!byWord.size) return found

  const exactHit = new Set<string>()
  const text = await dictText()

  let pos = 0
  while (pos < text.length) {
    let eol = text.indexOf('\n', pos)
    if (eol === -1) eol = text.length
    const line = text.slice(pos, eol)
    pos = eol + 1

    const t1 = line.indexOf('\t')
    if (t1 <= 0) continue
    const t2 = line.indexOf('\t', t1 + 1)
    if (t2 < 0) continue

    const reading = line.slice(t1 + 1, t2)
    const wordBucket = byWord.get(line.slice(0, t1))
    const readingBucket = reading ? byReading.get(reading) : undefined
    if (!wordBucket && !readingBucket) continue

    const accents = parseAccents(line.slice(t2 + 1))
    if (!accents.length) continue

    if (wordBucket) {
      for (const t of wordBucket) {
        const want = t.reading?.trim() ?? ''
        // 사전은 가나 단어의 읽기 칸을 비워둠
        const exact = reading ? reading === want : !want || want === t.jp
        if (exact) {
          found.set(t.id, accents)
          exactHit.add(t.id)
        } else if (!exactHit.has(t.id) && !found.has(t.id)) {
          found.set(t.id, accents) // 동형이의어 후보 — 정확 일치가 나오면 교체됨
        }
      }
    }
    // 읽기로만 찾은 건 확신도가 낮아 사전 순서상 첫 항목만 후보로 둠
    if (readingBucket) {
      for (const t of readingBucket) {
        if (!exactHit.has(t.id) && !found.has(t.id)) found.set(t.id, accents)
      }
    }
  }
  return found
}
