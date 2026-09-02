import { useMemo, useState } from 'react'
import Speaker from '../components/Speaker'
import type { SavedExample, Word } from '../types'

interface ExampleRow extends SavedExample {
  id: string
  word: Word
}

function legacyExample(word: Word): ExampleRow | null {
  const lines = word.example.split('\n').map(line => line.trim()).filter(Boolean)
  if (!lines.length) return null
  return {
    id: `${word.id}-legacy`, word, situation: '직접 저장한 예문',
    jp: lines[0], reading: '', ko: lines.slice(1).join(' ')
  }
}

export default function Examples({ words, onEdit }: { words: Word[]; onEdit: (word: Word) => void }) {
  const [query, setQuery] = useState('')
  const rows = useMemo(() => words.flatMap(word => {
    const generated = (word.examples ?? []).map((example, index) => ({
      ...example, reading: example.reading ?? '', id: `${word.id}-${index}`, word
    }))
    const legacy = legacyExample(word)
    if (legacy && !generated.some(item => item.jp === legacy.jp)) generated.push(legacy)
    return generated
  }).sort((a, b) => b.word.createdAt - a.word.createdAt), [words])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? rows.filter(row => [row.jp, row.reading, row.ko, row.word.jp, row.word.meaning]
      .join(' ').toLowerCase().includes(q)) : rows
  }, [rows, query])

  return (
    <section className="view examples-view">
      <div className="section-head examples-title">
        <div><h2>생활 예문 · {rows.length}</h2><p>히라가나를 보고 문장을 소리 내어 따라 해보세요.</p></div>
      </div>
      <div className="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
        <input className="search" placeholder="예문이나 단어로 검색" value={query} onChange={e => setQuery(e.target.value)} />
      </div>
      <div className="example-library">
        {!filtered.length && <div className="empty">저장된 예문이 없어요.<br />단어 수정에서 생활 예문을 만든 뒤 저장해 보세요.</div>}
        {filtered.map(row => (
          <article className="example-card" key={row.id}>
            <button className="example-source" onClick={() => onEdit(row.word)}>
              {row.word.jp} · {row.word.meaning}<span>{row.situation}</span>
            </button>
            <div className="example-sentence">
              <div>
                {row.reading && <div className="sentence-reading">{row.reading}</div>}
                <div className="sentence-jp">{row.jp}</div>
              </div>
              <Speaker text={row.jp} className="speaker-lg" label="예문 듣기" />
            </div>
            {row.ko && <div className="sentence-ko">{row.ko}</div>}
          </article>
        ))}
      </div>
    </section>
  )
}
