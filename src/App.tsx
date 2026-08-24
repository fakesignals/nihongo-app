import { useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { State } from './srs'
import { introducedToday, loadSettings, migrateFromV1 } from './store'
import { lookupAccents } from './pitch'
import type { Word } from './types'
import Library from './views/Library'
import Review from './views/Review'
import BulkImport from './views/BulkImport'
import EditorSheet from './components/EditorSheet'
import SettingsSheet from './components/SettingsSheet'

type View = 'library' | 'import' | 'review'

export default function App() {
  const [view, setView] = useState<View>('library')
  // undefined = 닫힘, null = 새 단어, Word = 수정
  const [editing, setEditing] = useState<Word | null | undefined>(undefined)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showPitch, setShowPitch] = useState(() => loadSettings().showPitch)
  const [toastMsg, setToastMsg] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const words = useLiveQuery(() => db.words.toArray(), []) ?? []

  const toast = (msg: string) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 1800)
  }

  useEffect(() => {
    navigator.storage?.persist?.().catch(() => {})
    ;(async () => {
      if ((await db.words.count()) === 0) {
        const n = await migrateFromV1()
        if (n) toast(`기존 앱 데이터 ${n}개를 가져왔어요`)
      }
    })()
  }, [])

  // 아직 조회하지 않은 단어의 고저 악센트를 사전에서 채움 (오프라인이면 다음 실행에 재시도)
  useEffect(() => {
    if (!showPitch || !words.length) return
    const missing = words.filter(w => w.accent === undefined)
    if (!missing.length) return
    let cancelled = false
    ;(async () => {
      try {
        const found = await lookupAccents(missing)
        if (cancelled) return
        await db.transaction('rw', db.words, () =>
          Promise.all(missing.map(w => db.words.update(w.id, { accent: found.get(w.id) ?? [] })))
        )
        if (found.size) toast(`피치 액센트 ${found.size}개를 찾았어요`)
      } catch {
        // 사전을 못 받았을 뿐이니 조용히 넘어감
      }
    })()
    return () => { cancelled = true }
  }, [words, showPitch])

  const now = Date.now()
  const dueCount = useMemo(
    () => words.filter(w => w.state !== State.New && w.due <= now).length,
    [words, now]
  )
  const newRemaining = Math.max(0, loadSettings().newPerDay - introducedToday())
  const newAvailable = Math.min(newRemaining, words.filter(w => w.state === State.New).length)
  const todayTotal = dueCount + newAvailable
  const learned = words.filter(w => w.state === State.Review).length

  return (
    <>
      <main className="app">
        <header className="topbar">
          <div>
            <div className="eyebrow">Nihongo Pocket</div>
            <h1>일본어 기초노트</h1>
            <div className="subtitle">듀오링고 복습을 내 방식대로.</div>
          </div>
          <button className="icon-btn" aria-label="설정" onClick={() => setSettingsOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 3.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2v-4h-.1A1.7 1.7 0 0 0 3.6 8a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8 3.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V2h4v.1A1.7 1.7 0 0 0 15 3.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 8c.17.38.38.72.6 1 .29.37.67.6 1.1.6h.1v4h-.1c-.43 0-.81.23-1.1.6-.22.28-.43.62-.6 1Z"/></svg>
          </button>
        </header>

        <section className="hero">
          <div className="hero-title">오늘의 복습 포켓</div>
          <div className="hero-main">
            {todayTotal ? `오늘 복습할 카드 ${todayTotal}장` : '오늘 복습은 모두 끝났어요!'}
          </div>
          <div className="stats">
            <div className="stat"><b>{words.length}</b><span>전체 단어</span></div>
            <div className="stat"><b>{todayTotal}</b><span>오늘 복습</span></div>
            <div className="stat"><b>{learned}</b><span>외운 단어</span></div>
          </div>
        </section>

        {view === 'library' && <Library words={words} onEdit={w => setEditing(w)} showPitch={showPitch} />}
        {view === 'import' && <BulkImport words={words} toast={toast} />}
        {view === 'review' && <Review words={words} toast={toast} showPitch={showPitch} />}
      </main>

      <nav className="bottom-nav">
        <button className={`nav-btn ${view === 'library' ? 'active' : ''}`} onClick={() => setView('library')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/></svg>단어장
        </button>
        <button className={`nav-btn ${view === 'import' ? 'active' : ''}`} onClick={() => setView('import')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 19h16"/></svg>입력
        </button>
        <button className={`nav-btn ${view === 'review' ? 'active' : ''}`} onClick={() => setView('review')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/><path d="M12 3a9 9 0 1 1-8.5 6"/></svg>복습
          {todayTotal > 0 && <span className="nav-badge">{todayTotal}</span>}
        </button>
      </nav>

      {view === 'library' && (
        <button className="fab" aria-label="단어 추가" onClick={() => setEditing(null)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      )}

      {editing !== undefined && (
        <EditorSheet word={editing} words={words} onClose={() => setEditing(undefined)} toast={toast} />
      )}
      {settingsOpen && (
        <SettingsSheet
          words={words}
          onClose={() => setSettingsOpen(false)}
          toast={toast}
          onSettingsChange={() => setShowPitch(loadSettings().showPitch)}
        />
      )}

      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
    </>
  )
}
