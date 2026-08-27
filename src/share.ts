import type { WordInput } from './store'
import type { Word } from './types'

/** 공유에 담는 필드. 학습 진도(FSRS 카드·즐겨찾기)는 받는 쪽에서 새로 시작하도록 빼둔다 */
const FIELDS = ['jp', 'reading', 'meaning', 'category', 'polite', 'example'] as const

/** 키 이름을 빼고 배열로 눕혀서 링크 길이를 줄임 */
function pack(words: Word[]) {
  return {
    v: 1,
    w: words.map(w => {
      const row: string[] = FIELDS.map(f => w[f] ?? '')
      while (row.length && row[row.length - 1] === '') row.pop()
      return row
    })
  }
}

function unpack(data: unknown): WordInput[] {
  const d = data as { v?: number; w?: unknown }
  if (!d || d.v !== 1 || !Array.isArray(d.w)) throw new Error('bad share payload')
  return (d.w as unknown[])
    .filter(Array.isArray)
    .map(row => {
      const o: Record<string, string> = {}
      FIELDS.forEach((f, i) => { o[f] = typeof row[i] === 'string' ? row[i] : '' })
      return o as unknown as WordInput
    })
    .filter(w => w.jp && w.meaning)
}

// ---- base64url ----
function toB64(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromB64(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

// ---- 압축 (iOS 16.4+ / 최신 크롬. 없으면 압축 없이 담는다) ----
const canZip = typeof CompressionStream !== 'undefined'

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const blob = new Blob([bytes as BlobPart])
  const buf = await new Response(blob.stream().pipeThrough(stream)).arrayBuffer()
  return new Uint8Array(buf)
}

export async function encodeShare(words: Word[]): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(pack(words)))
  if (!canZip) return 'u' + toB64(json)
  return 'z' + toB64(await pipe(json, new CompressionStream('deflate-raw')))
}

export async function decodeShare(code: string): Promise<WordInput[]> {
  const tag = code[0]
  if (tag !== 'z' && tag !== 'u') throw new Error('unknown share format')
  let bytes = fromB64(code.slice(1))
  if (tag === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'))
  return unpack(JSON.parse(new TextDecoder().decode(bytes)))
}

/** 메신저가 링크를 자르지 않고 넘겨주는 대략적인 상한 */
export const LINK_LIMIT = 4000

export function shareLinkFor(code: string): string {
  return `${location.origin}${location.pathname}#w=${code}`
}

/** 링크로 열렸다면 공유 코드를 돌려줌 */
export function readIncomingCode(): string | null {
  const m = location.hash.match(/^#w=(.+)$/)
  return m ? m[1] : null
}

/** 붙여넣은 링크(또는 코드만)에서 공유 코드를 뽑아냄 */
export function extractCode(text: string): string | null {
  const t = text.trim()
  const m = t.match(/#w=([A-Za-z0-9_-]+)/)
  if (m) return m[1]
  return /^[zu][A-Za-z0-9_-]+$/.test(t) ? t : null
}

/** 새로고침할 때 다시 묻지 않도록 주소에서 코드를 지움 */
export function clearIncomingCode() {
  history.replaceState(null, '', location.pathname + location.search)
}

/** 카톡 등 인앱 브라우저는 저장소가 따로라, 여기서 받으면 진짜 앱에는 안 들어간다 */
export const inAppBrowser = /KAKAOTALK|Instagram|FB[AI][NV]|Line\/|NAVER\(inapp/i.test(
  typeof navigator === 'undefined' ? '' : navigator.userAgent
)
