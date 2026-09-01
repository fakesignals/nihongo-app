import { useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { State } from './srs'
import {
  fingerprint, loadCloud, pullAndSync, pushGist, readConnectId, saveCloud, syncMessage
} from './cloud'
import { clearIncomingCode, decodeShare, readIncomingCode } from './share'
import { exportJSON, introducedToday, loadSettings, migrateFromV1, type WordInput } from './store'
import type { Word } from './types'
import Library from './views/Library'
import Review from './views/Review'
import BulkImport from './views/BulkImport'
import EditorSheet from './components/EditorSheet'
import SettingsSheet from './components/SettingsSheet'
import ShareInbox from './components/ShareInbox'
import QuickCaptureSheet from './components/QuickCaptureSheet'
import DraftOrganizerSheet from './components/DraftOrganizerSheet'

type View = 'library' | 'import' | 'review'

export default function App() {
  const [view, setView] = useState<View>('library')
  // undefined = 닫힘, null = 새 단어, Word = 수정
  const [editing, setEditing] = useState<Word | null | undefined>(undefined)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [organizing, setOrganizing] = useState(false)
  // 공유 링크로 열렸을 때 받은 단어
  const [incoming, setIncoming] = useState<WordInput[] | null>(null)
  const [toastMsg, setToastMsg] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // undefined = 아직 IndexedDB에서 읽는 중. 빈 목록을 올려버리지 않으려고 구분해 둔다
  const wordsRaw = useLiveQuery(() => db.words.toArray(), [])
  const words = wordsRaw ?? []

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

  // 보관함 연결 링크(#g=...)로 열렸으면 이 기기를 '받는 쪽'으로 등록한다
  useEffect(() => {
    const id = readConnectId()
    if (!id) return
    const cfg = loadCloud()
    if (cfg?.gistId !== id) {
      saveCloud({ ...cfg, gistId: id })
      toast('PC 단어장에 연결했어요')
    }
    clearIncomingCode()
  }, [])

  // 받는 쪽이면 앱을 열 때, 그리고 다시 앱으로 돌아올 때 새 단어를 받아온다
  useEffect(() => {
    let last = 0
    const pull = () => {
      const cfg = loadCloud()
      if (!cfg?.gistId || cfg.token) return
      // 화면을 자주 오갈 때 매번 요청하지 않도록 1분에 한 번으로 묶는다
      if (Date.now() - last < 60_000) return
      last = Date.now()
      pullAndSync(cfg.gistId)
        .then(({ added, updated }) => {
          saveCloud({ ...loadCloud()!, lastSync: Date.now() })
          const msg = syncMessage(added, updated)
          if (msg) toast(msg)
        })
        .catch(() => {}) // 오프라인이면 다음에 열 때 다시 받는다
    }
    const onVisible = () => { if (document.visibilityState === 'visible') pull() }
    pull()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  // 올리는 쪽(PC)이면 단어가 바뀔 때마다 보관함을 갱신한다
  useEffect(() => {
    const cfg = loadCloud()
    if (!cfg?.token || !wordsRaw?.length) return
    const content = exportJSON(wordsRaw, false)
    const hash = fingerprint(content)
    if (hash === cfg.pushedHash) return
    const timer = setTimeout(() => {
      pushGist(cfg.gistId, cfg.token!, content)
        .then(() => saveCloud({ ...loadCloud()!, pushedHash: hash, lastSync: Date.now() }))
        .catch(() => {}) // 실패하면 다음 변경 때 다시 시도
    }, 4000)
    return () => clearTimeout(timer)
  }, [wordsRaw])

  // 공유 링크(#w=...)로 열렸으면 받은 단어를 확인 시트로 띄운다
  useEffect(() => {
    const code = readIncomingCode()
    if (!code) return
    clearIncomingCode()
    decodeShare(code)
      .then(ws => (ws.length ? setIncoming(ws) : toast('링크에 담긴 단어가 없어요')))
      .catch(() => toast('공유 링크를 읽지 못했어요'))
  }, [])

  const now = Date.now()
  const studyWords = useMemo(() => words.filter(w => w.meaning.trim()), [words])
  const dueCount = useMemo(
    () => studyWords.filter(w => w.state !== State.New && w.due <= now).length,
    [studyWords, now]
  )
  const newRemaining = Math.max(0, loadSettings().newPerDay - introducedToday())
  const newAvailable = Math.min(newRemaining, studyWords.filter(w => w.state === State.New).length)
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

        {view === 'library' && (
          <Library words={words} onEdit={w => setEditing(w)} onOrganize={() => setOrganizing(true)} />
        )}
        {view === 'import' && <BulkImport words={words} toast={toast} />}
        {view === 'review' && <Review words={studyWords} toast={toast} />}
      </main>

      <nav className="bottom-nav">
        <button className={`nav-btn ${view === 'library' ? 'active' : ''}`} onClick={() => setView('library')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/></svg>단어장
        </button>
        <button className={`nav-btn ${view === 'import' ? 'active' : ''}`} onClick={() => setView('import')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 19h16"/></svg>수집
        </button>
        <button className={`nav-btn ${view === 'review' ? 'active' : ''}`} onClick={() => setView('review')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/><path d="M12 3a9 9 0 1 1-8.5 6"/></svg>복습
          {todayTotal > 0 && <span className="nav-badge">{todayTotal}</span>}
        </button>
      </nav>

      {view === 'library' && (
        <button className="fab" aria-label="빠르게 단어 기록" onClick={() => setQuickOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      )}

      {editing !== undefined && (
        <EditorSheet word={editing} words={words} onClose={() => setEditing(undefined)} toast={toast} />
      )}
      {quickOpen && (
        <QuickCaptureSheet
          onClose={() => setQuickOpen(false)}
          onDetailed={() => { setQuickOpen(false); setEditing(null) }}
          toast={toast}
        />
      )}
      {organizing && (
        <DraftOrganizerSheet words={words} onClose={() => setOrganizing(false)} toast={toast} />
      )}
      {settingsOpen && (
        <SettingsSheet words={words} onClose={() => setSettingsOpen(false)} toast={toast} />
      )}
      {incoming && (
        <ShareInbox incoming={incoming} onClose={() => setIncoming(null)} toast={toast} />
      )}

      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
    </>
  )
}
