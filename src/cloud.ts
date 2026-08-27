/**
 * PC에서 정리한 단어를 GitHub Gist에 올려두고 폰이 받아가는 한 방향 전송.
 * 서버를 따로 두지 않으려고 Gist를 파일 보관함처럼 쓴다.
 * 토큰은 올리는 기기(PC)의 localStorage에만 있고, 링크·Gist 어디에도 담기지 않는다.
 */
import { parseBackup, syncWords } from './store'

const API = 'https://api.github.com/gists'
const FILE = 'nihongo-pocket.json'
const KEY = 'nihongo-pocket-cloud'

export interface CloudConfig {
  gistId: string
  /** 있으면 이 기기가 '올리는 쪽'. 없으면 '받는 쪽' */
  token?: string
  /** 마지막으로 올린 내용의 지문 — 같은 내용을 다시 올리지 않으려고 */
  pushedHash?: string
  lastSync?: number
}

export function loadCloud(): CloudConfig | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CloudConfig) : null
  } catch {
    return null
  }
}

export function saveCloud(cfg: CloudConfig | null) {
  if (cfg) localStorage.setItem(KEY, JSON.stringify(cfg))
  else localStorage.removeItem(KEY)
}

/** 내용이 바뀌었는지만 보면 되므로 가벼운 해시로 충분 */
export function fingerprint(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0
  return h.toString(36) + '-' + s.length.toString(36)
}

async function gh(url: string, token?: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('토큰이 잘못됐거나 만료됐어요')
    if (res.status === 403) throw new Error('토큰에 Gist 권한이 없어요')
    if (res.status === 404) throw new Error('보관함을 찾지 못했어요')
    throw new Error(`GitHub 오류 (${res.status})`)
  }
  return res.json()
}

export async function createGist(token: string, content: string): Promise<string> {
  const data = await gh(API, token, {
    method: 'POST',
    body: JSON.stringify({
      description: 'Nihongo Pocket 단어장 (앱이 자동으로 갱신합니다)',
      public: false,
      files: { [FILE]: { content } }
    })
  })
  if (!data.id) throw new Error('보관함을 만들지 못했어요')
  return data.id as string
}

export async function pushGist(gistId: string, token: string, content: string) {
  await gh(`${API}/${gistId}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ files: { [FILE]: { content } } })
  })
}

/** 받는 쪽은 토큰 없이 읽는다 (비공개 Gist도 주소를 알면 읽힌다) */
export async function pullGist(gistId: string): Promise<string> {
  const data = await gh(`${API}/${gistId}`)
  const files = (data.files ?? {}) as Record<string, { content?: string; truncated?: boolean; raw_url?: string }>
  const file = files[FILE] ?? Object.values(files)[0]
  if (!file) throw new Error('보관함이 비어 있어요')
  // 파일이 크면 API가 내용을 잘라 보내므로 원본을 따로 받아온다
  if (file.truncated && file.raw_url) {
    const res = await fetch(file.raw_url, { cache: 'no-store' })
    if (!res.ok) throw new Error('보관함을 읽지 못했어요')
    return res.text()
  }
  return file.content ?? ''
}

export function connectLinkFor(gistId: string): string {
  return `${location.origin}${location.pathname}#g=${gistId}`
}

/** 연결 링크로 열렸다면 보관함 id를 돌려줌 */
export function readConnectId(): string | null {
  const m = location.hash.match(/^#g=([0-9a-zA-Z]+)$/)
  return m ? m[1] : null
}

/** 붙여넣은 연결 링크(또는 id만)에서 보관함 id를 뽑아냄 */
export function extractGistId(text: string): string | null {
  const t = text.trim()
  const hash = t.match(/#g=([0-9a-zA-Z]+)/)
  if (hash) return hash[1]
  const url = t.match(/gist\.github\.com\/(?:[^/]+\/)?([0-9a-f]{6,})/i)
  if (url) return url[1]
  return /^[0-9a-f]{6,}$/i.test(t) ? t : null
}

/** 보관함을 받아 내 단어장에 반영. 새 단어는 추가하고, 바뀐 내용은 덮어쓴다 */
export async function pullAndSync(gistId: string) {
  return syncWords(parseBackup(await pullGist(gistId)))
}

/** 받은 결과를 알릴 문구. 아무것도 안 바뀌었으면 빈 문자열 */
export function syncMessage(added: number, updated: number): string {
  const parts: string[] = []
  if (added) parts.push(`새 단어 ${added}개`)
  if (updated) parts.push(`수정 ${updated}개`)
  return parts.length ? parts.join(' · ') + '를 받았어요' : ''
}
