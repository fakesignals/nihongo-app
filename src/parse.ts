import type { WordInput } from './store'

type Field = 'jp' | 'reading' | 'meaning' | 'category' | 'polite' | 'example'

/** 헤더 줄에 쓸 수 있는 칸 이름 */
const HEADERS: Record<string, Field> = {
  일본어: 'jp', 단어: 'jp', 표기: 'jp', jp: 'jp', word: 'jp',
  읽기: 'reading', 후리가나: 'reading', 요미: 'reading', 발음: 'reading', reading: 'reading', kana: 'reading',
  뜻: 'meaning', 의미: 'meaning', 한국어: 'meaning', meaning: 'meaning', ko: 'meaning',
  분류: 'category', 카테고리: 'category', category: 'category', tag: 'category',
  정중형: 'polite', 정중: 'polite', ます형: 'polite', polite: 'polite',
  예문: 'example', 예: 'example', example: 'example'
}

/** 탭 > | > 쉼표 > ' - ' > = > 공백 순으로 구분자를 추정 */
function splitCells(line: string): string[] {
  let parts: string[]
  if (line.includes('\t')) parts = line.split('\t')
  else if (line.includes('|')) parts = line.split('|')
  else if (/[,，]/.test(line)) parts = line.split(/[,，]/)
  else if (line.includes(' - ')) parts = line.split(' - ')
  else if (line.includes('=')) parts = line.split('=')
  else parts = line.split(/\s+/)
  return parts.map(p => p.trim())
}

/** 食べる(たべる) 형태에서 읽기를 떼어냄 */
function splitReading(cell: string): { jp: string; reading: string } {
  const m = cell.match(/^(.+?)[（(]([^)）]+)[)）]$/)
  return m ? { jp: m[1].trim(), reading: m[2].trim() } : { jp: cell.trim(), reading: '' }
}

/** 모든 칸이 아는 이름이고 일본어 칸이 있으면 헤더 줄로 인정 */
function parseHeader(cells: string[]): Field[] | null {
  if (cells.length < 2) return null
  const fields = cells.map(c => HEADERS[c.toLowerCase().replace(/\s+/g, '')])
  if (fields.some(f => !f) || !fields.includes('jp')) return null
  return fields as Field[]
}

function fromHeader(cells: string[], header: Field[]): WordInput {
  const out: Record<string, string> = {}
  header.forEach((f, i) => { if (cells[i]) out[f] = cells[i] })
  const { jp, reading } = splitReading(out.jp ?? '')
  return { ...out, jp, reading: out.reading || reading } as unknown as WordInput
}

/** 헤더가 없을 때: 칸 수와 가나 여부로 추측 */
function guessRow(cells: string[]): WordInput {
  const parts = cells.filter(Boolean)
  const { jp, reading } = splitReading(parts[0] ?? '')
  if (parts.length <= 1) return { jp, reading, meaning: '' }
  if (parts.length === 2) return { jp, reading, meaning: parts[1] }
  // 3칸 이상: 2번째가 전부 가나면 읽기로 본다
  const isKana = /^[぀-ヿー・\s]+$/.test(parts[1])
  if (isKana && !reading) {
    return { jp, reading: parts[1], meaning: parts[2], example: parts.slice(3).join('\n') }
  }
  return { jp, reading, meaning: parts[1], example: parts.slice(2).join('\n') }
}

/**
 * 붙여넣은 여러 줄을 단어로 바꾼다.
 * - '#'으로 시작하는 줄은 그 아래 단어들의 카테고리
 * - 칸 이름만으로 된 줄은 헤더로 보고 이후 줄을 그 순서대로 읽는다
 */
export function parseWordLines(text: string, fallbackCategory: string): WordInput[] {
  const out: WordInput[] = []
  let header: Field[] | null = null
  let lineCat = ''

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('#')) { lineCat = line.replace(/^#+/, '').trim(); continue }

    const cells = splitCells(line)
    const asHeader = parseHeader(cells)
    if (asHeader) { header = asHeader; continue }

    const row = header ? fromHeader(cells, header) : guessRow(cells)
    if (!row.jp) continue
    out.push({ ...row, category: row.category || lineCat || fallbackCategory })
  }
  return out
}
