import { useEffect, useMemo, useState } from 'react'
import { db } from '../db'
import { dueLabel, State } from '../srs'
import { loadSettings, saveSettings } from '../store'
import type { Word } from '../types'
import Furigana from '../components/Furigana'
import Speaker from '../components/Speaker'
import { speakText } from '../speak'

export default function Library({ words, onEdit }: { words: Word[]; onEdit: (w: Word) => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('전체')
  const [onlyFav, setOnlyFav] = useState(false)
  const [hideMeaning, setHideMeaning] = useState(() => loadSettings().hideMeaning)
  // 가리기 모드에서 탭으로 공개해 둔 카드들
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

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

  // 목록이 바뀌면(검색·필터) 공개해 둔 것들을 다시 가림
  useEffect(() => {
    setRevealed(new Set())
  }, [query, category, onlyFav])

  const toggleHideMeaning = () => {
    const next = !hideMeaning
    setHideMeaning(next)
    setRevealed(new Set())
    saveSettings({ ...loadSettings(), hideMeaning: next })
  }

  const toggleReveal = (id: string) => {
    setRevealed(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
        <button
          className={`switch ${hideMeaning ? 'on' : ''}`}
          aria-pressed={hideMeaning}
          onClick={toggleHideMeaning}
        >
          뜻 가리기<span className="switch-track"><span className="switch-knob" /></span>
        </button>
      </div>

      <div className="list">
        {filtered.length === 0 && (
          <div className="empty">
            조건에 맞는 단어가 없어요.<br />
            + 버튼으로 추가하거나, [입력] 탭에서 듀오링고 단어를 한 번에 붙여넣어 보세요.
          </div>
        )}
        {filtered.map(w => {
          const masked = hideMeaning && !revealed.has(w.id)
          return (
            <article key={w.id} className="word-card" onClick={() => onEdit(w)}>
              <div className="wc-top">
                <div className="wc-jp">
                  <div className="word-jp"><Furigana jp={w.jp} reading={w.reading} /></div>
                  <Speaker text={speakText(w)} />
                </div>
                {masked ? (
                  <button
                    className="meaning-mask"
                    aria-label="뜻 보기"
                    onClick={e => { e.stopPropagation(); toggleReveal(w.id) }}
                  >
                    <i /><i /><i />
                  </button>
                ) : (
                  <div
                    className={`meaning ${hideMeaning ? 'revealed' : ''}`}
                    onClick={hideMeaning ? e => { e.stopPropagation(); toggleReveal(w.id) } : undefined}
                  >
                    {w.meaning}{w.polite ? <> · <b>{w.polite}</b></> : null}
                  </div>
                )}
                <button
                  className={`fav ${w.fav ? 'active' : ''}`}
                  aria-label="즐겨찾기"
                  onClick={e => { e.stopPropagation(); toggleFav(w) }}
                >
                  <svg viewBox="0 0 24 24" fill={w.fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><path d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z"/></svg>
                </button>
              </div>
              {/* 카테고리는 위 칩으로 거르니 카드에서는 빼고 복습 일정만 남긴다 */}
              <div className="meta">
                <span className={`tag meta-right ${w.state === State.New ? 'new-tag' : w.due <= Date.now() ? 'due-tag' : ''}`}>
                  {dueLabel(w)}
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
