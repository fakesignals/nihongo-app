import { useMemo, useState } from 'react'
import Speaker from '../components/Speaker'
import type { Word } from '../types'

export default function Examples({ words, onEdit }: { words: Word[]; onEdit: (word: Word) => void }) {
  const [query, setQuery] = useState('')
  const rows = useMemo(() => words.flatMap(word => {
    return (word.examples ?? []).filter(example => example.selected).map((example, index) => ({
      ...example, reading: example.reading ?? '', id: `${word.id}-${index}`, word
    }))
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
        {!filtered.length && <div className="empty">추가한 Gemini 예문이 없어요.<br />단어 수정에서 원하는 생활 예문만 추가해 보세요.</div>}
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
