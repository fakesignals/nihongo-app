import { useMemo, useState } from 'react'
import { db } from '../db'
import { dueLabel, State } from '../srs'
import type { Word } from '../types'
import Furigana from '../components/Furigana'

export default function Library({ words, onEdit }: { words: Word[]; onEdit: (w: Word) => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('전체')
  const [onlyFav, setOnlyFav] = useState(false)

  const categories = useMemo(
    () => [...new Set(words.map(w => w.category || '기타'))].sort((a, b) => a.localeCompare(b, 'ko')),
    [words]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = words.filter(
      w => (category === '전체' || w.category === category) && (!onlyFav || w.fav)
    )
    if (q) {
      list = list.filter(w =>
        [w.jp, w.reading, w.meaning, w.polite, w.category, w.example].join(' ').toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => b.createdAt - a.createdAt)
  }, [words, query, category, onlyFav])

  const toggleFav = async (w: Word) => {
    await db.words.update(w.id, { fav: w.fav ? 0 : 1 })
  }

  return (
    <section className="view">
      <div className="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
        <input
          className="search"
          placeholder="일본어, 읽기, 뜻으로 검색"
          autoComplete="off"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="section-head">
        <h2>카테고리</h2>
        <button onClick={() => setOnlyFav(v => !v)}>{onlyFav ? '★ 즐겨찾기만' : '☆ 즐겨찾기만'}</button>
      </div>
      <div className="chips">
        {['전체', ...categories].map(c => (
          <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="section-head">
        <h2>{category === '전체' ? '전체 단어' : category} · {filtered.length}</h2>
      </div>

      <div className="list">
        {filtered.length === 0 && (
          <div className="empty">
            조건에 맞는 단어가 없어요.<br />
            + 버튼으로 추가하거나, [입력] 탭에서 듀오링고 단어를 한 번에 붙여넣어 보세요.
          </div>
        )}
        {filtered.map(w => (
          <article key={w.id} className="word-card" onClick={() => onEdit(w)}>
            <div className="wc-top">
              <div className="word-jp"><Furigana jp={w.jp} reading={w.reading} /></div>
              <button
                className={`fav ${w.fav ? 'active' : ''}`}
                aria-label="즐겨찾기"
                onClick={e => { e.stopPropagation(); toggleFav(w) }}
              >
                <svg viewBox="0 0 24 24" fill={w.fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><path d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z"/></svg>
              </button>
            </div>
            <div className="meaning">{w.meaning}{w.polite ? <> · <b>{w.polite}</b></> : null}</div>
            <div className="meta">
              <span className="tag">{w.category || '기타'}</span>
              <span className={`tag meta-right ${w.state === State.New ? 'new-tag' : w.due <= Date.now() ? 'due-tag' : ''}`}>
                {dueLabel(w)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
