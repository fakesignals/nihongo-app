import { useMemo, useState } from 'react'
import { db } from '../db'
import { makeWord, type WordInput } from '../store'
import type { Word } from '../types'

interface ParsedRow extends WordInput {
  duplicate: boolean
  incomplete: boolean
}

/** 한 줄을 [일본어, 읽기?, 뜻, 예문?]으로 파싱. 탭 > | > 쉼표 > ' - ' 순으로 구분자 추정 */
function parseLine(line: string): WordInput | null {
  const l = line.trim()
  if (!l) return null
  let parts: string[]
  if (l.includes('\t')) parts = l.split('\t')
  else if (l.includes('|')) parts = l.split('|')
  else if (/[,，]/.test(l)) parts = l.split(/[,，]/)
  else if (l.includes(' - ')) parts = l.split(' - ')
  else if (l.includes('=')) parts = l.split('=')
  else parts = l.split(/\s+/)
  parts = parts.map(p => p.trim()).filter(Boolean)

  let jp = parts[0] ?? ''
  let reading = ''
  // 食べる(たべる) 형태에서 읽기 추출
  const m = jp.match(/^(.+?)[（(]([^)）]+)[)）]$/)
  if (m) { jp = m[1].trim(); reading = m[2].trim() }

  if (parts.length <= 1) return { jp, reading, meaning: '' }
  if (parts.length === 2) return { jp, reading, meaning: parts[1] }
  // 3개 이상: 2번째 칸이 히라가나/가타카나면 읽기로 간주
  const second = parts[1]
  const isKana = /^[぀-ヿー・\s]+$/.test(second)
  if (isKana && !reading) {
    return { jp, reading: second, meaning: parts[2], example: parts.slice(3).join('\n') }
  }
  return { jp, reading, meaning: second, example: parts.slice(2).join('\n') }
}

export default function BulkImport({ words, toast }: { words: Word[]; toast: (m: string) => void }) {
  const [text, setText] = useState('')
  const [category, setCategory] = useState('')

  const existing = useMemo(() => new Set(words.map(w => w.jp)), [words])
  const categories = useMemo(
    () => [...new Set(words.map(w => w.category || '기타'))].sort((a, b) => a.localeCompare(b, 'ko')),
    [words]
  )

  const rows: ParsedRow[] = useMemo(() => {
    const seen = new Set<string>()
    return text.split('\n').map(parseLine).filter((r): r is WordInput => r !== null).map(r => {
      const duplicate = existing.has(r.jp) || seen.has(r.jp)
      seen.add(r.jp)
      return { ...r, duplicate, incomplete: !r.meaning }
    })
  }, [text, existing])

  const importable = rows.filter(r => !r.duplicate && !r.incomplete)

  const doImport = async () => {
    if (!importable.length) return
    const newWords = importable.map(r => makeWord({ ...r, category: category || '듀오링고' }))
    await db.words.bulkAdd(newWords)
    toast(`${newWords.length}개 단어를 추가했어요`)
    setText('')
  }

  return (
    <section className="view">
      <div className="import-box">
        <h3>듀오링고 단어 한 번에 넣기</h3>
        <p className="hint">
          한 줄에 한 단어씩 붙여넣으세요. 구분은 탭·쉼표·공백 모두 인식해요.<br />
          <code>食べる たべる 먹다</code> / <code>食べる(たべる), 먹다</code> / <code>水 물</code>
        </p>
        <textarea
          className="import-textarea"
          placeholder={'食べる\tたべる\t먹다\n水\tみず\t물\n猫(ねこ) 고양이'}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="import-row">
          <input
            className="search"
            style={{ padding: '12px 14px', flex: 1 }}
            list="importCategoryList"
            placeholder="카테고리 (비우면 '듀오링고')"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
          <datalist id="importCategoryList">
            {categories.map(c => <option key={c} value={c} />)}
          </datalist>
          <button className="primary" style={{ flex: 'none' }} disabled={!importable.length} onClick={doImport}>
            {importable.length ? `${importable.length}개 추가` : '추가'}
          </button>
        </div>

        {rows.length > 0 && (
          <div className="preview-list">
            {rows.map((r, i) => (
              <div key={i} className={`preview-item ${r.duplicate ? 'dup' : ''}`}>
                <b>{r.jp}</b>
                {r.reading && <span className="p-reading">{r.reading}</span>}
                <span className="p-meaning">{r.meaning || '뜻 없음'}</span>
                {r.duplicate && <span className="p-flag">중복</span>}
                {!r.duplicate && r.incomplete && <span className="p-flag">뜻을 입력하세요</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
