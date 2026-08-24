import { useEffect, useMemo, useState } from 'react'
import { db } from '../db'
import { previewIntervals, rate, Rating, State, type Grade } from '../srs'
import { bumpIntroducedToday, introducedToday, loadSettings, saveSettings } from '../store'
import type { ReviewMode, ReviewScope, Word } from '../types'
import Furigana from '../components/Furigana'

// 학습 단계(Again 직후 등) 카드는 몇 분 뒤가 만기여도 세션이 끊기지 않게 이어서 보여줌
const LEARN_AHEAD_MS = 15 * 60 * 1000

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Review({ words, toast }: { words: Word[]; toast: (m: string) => void }) {
  const [mode, setMode] = useState<ReviewMode>(() => loadSettings().mode)
  const [scope, setScope] = useState<ReviewScope>('today')
  const [category, setCategory] = useState('전체')
  const [revealed, setRevealed] = useState(false)
  const [doneCount, setDoneCount] = useState(0)
  const [cramQueue, setCramQueue] = useState<string[] | null>(null)
  const [cramIdx, setCramIdx] = useState(0)

  const ready = words.length > 0
  const categories = useMemo(
    () => [...new Set(words.map(w => w.category || '기타'))].sort((a, b) => a.localeCompare(b, 'ko')),
    [words]
  )
  const pool = useMemo(
    () => words.filter(w => category === '전체' || w.category === category),
    [words, category]
  )

  // 오늘 복습: 만기 카드 → 신규 카드(일일 한도 내) 순서로 동적으로 뽑음
  const now = Date.now()
  const dueList = useMemo(
    () => pool.filter(w => w.state !== State.New && w.due <= now + LEARN_AHEAD_MS).sort((a, b) => a.due - b.due),
    [pool, now]
  )
  const newList = useMemo(
    () => pool.filter(w => w.state === State.New).sort((a, b) => a.createdAt - b.createdAt),
    [pool]
  )
  const allowance = Math.max(0, loadSettings().newPerDay - introducedToday())

  const rebuildCram = (s: ReviewScope) => {
    const source = s === 'fav' ? pool.filter(w => w.fav) : pool
    setCramQueue(shuffle(source.map(w => w.id)))
    setCramIdx(0)
  }

  useEffect(() => {
    setRevealed(false)
    if (scope === 'today') { setCramQueue(null); return }
    rebuildCram(scope)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, category, ready])

  const current: Word | undefined =
    scope === 'today'
      ? dueList[0] ?? (allowance > 0 ? newList[0] : undefined)
      : cramQueue ? words.find(w => w.id === cramQueue[cramIdx]) : undefined

  const remaining =
    scope === 'today'
      ? dueList.length + Math.min(allowance, newList.length)
      : cramQueue ? cramQueue.length - cramIdx : 0

  const intervals = useMemo(
    () => (current ? previewIntervals(current.card) : null),
    [current]
  )

  const onRate = async (grade: Grade) => {
    if (!current) return
    const wasNew = current.state === State.New
    const nextCard = rate(current.card, grade)
    await db.words.update(current.id, {
      card: nextCard,
      due: nextCard.due.getTime(),
      state: nextCard.state
    })
    if (wasNew && scope === 'today') bumpIntroducedToday()
    setDoneCount(c => c + 1)
    setRevealed(false)
    if (cramQueue) setCramIdx(i => i + 1)
  }

  const changeMode = (m: ReviewMode) => {
    setMode(m)
    saveSettings({ ...loadSettings(), mode: m })
    setRevealed(false)
  }

  const front = current ? (mode === 'jp-ko' ? current.jp : current.meaning) : ''

  return (
    <section className="view">
      <div className="review-toolbar">
        <select className="mini-select" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="전체">전체 카테고리</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="mini-select" value={mode} onChange={e => changeMode(e.target.value as ReviewMode)}>
          <option value="jp-ko">일본어 → 한국어</option>
          <option value="ko-jp">한국어 → 일본어</option>
        </select>
        <select className="mini-select" value={scope} onChange={e => setScope(e.target.value as ReviewScope)}>
          <option value="today">오늘 복습 (FSRS)</option>
          <option value="fav">즐겨찾기 자유 복습</option>
          <option value="all">전체 자유 복습</option>
        </select>
      </div>

      {!current ? (
        <div className="flashcard done-card">
          <div>
            <div className="big">{scope === 'today' ? '🎉' : '🌀'}</div>
            <h3>{scope === 'today' ? '오늘 복습 완료!' : '한 바퀴 다 돌았어요!'}</h3>
            <p>
              {scope === 'today'
                ? doneCount
                  ? `카드 ${doneCount}장을 복습했어요. 내일 또 만나요.`
                  : '지금은 복습할 카드가 없어요. [입력] 탭에서 단어를 추가해 보세요.'
                : '한 번 더 돌리거나 필터를 바꿔보세요.'}
            </p>
          </div>
          {scope !== 'today' && (
            <button className="reveal" onClick={() => { rebuildCram(scope); toast('순서를 다시 섞었어요') }}>
              다시 섞기
            </button>
          )}
        </div>
      ) : (
        <div className="flashcard">
          <div className="progress">
            <span>{scope === 'today' ? 'TODAY' : 'FREE'} · 남은 카드 {remaining}</span>
            <span>{current.state === State.New ? 'NEW' : ''}</span>
          </div>
          <div>
            <div className="question-label">
              {mode === 'jp-ko' ? '뜻을 떠올려 보세요' : '일본어를 떠올려 보세요'}
            </div>
            <div className={`question ${front.length > 7 ? 'small' : ''}`}>{front}</div>
            {revealed && (
              <div className="answer">
                {mode === 'jp-ko' ? (
                  <>
                    {current.reading && current.reading !== current.jp && (
                      <div className="answer-reading">{current.reading}</div>
                    )}
                    <div className="answer-main">{current.meaning}</div>
                  </>
                ) : (
                  <div className="answer-main jp">
                    <Furigana jp={current.jp} reading={current.reading} />
                    {current.polite ? <span className="answer-polite"> · {current.polite}</span> : null}
                  </div>
                )}
                {current.example && <div className="example">{current.example}</div>}
              </div>
            )}
          </div>
          {!revealed ? (
            <button className="reveal" onClick={() => setRevealed(true)}>정답 보기</button>
          ) : (
            <div className="ratings">
              <button className="rate again" onClick={() => onRate(Rating.Again)}>
                😵 다시<small>{intervals?.[Rating.Again]}</small>
              </button>
              <button className="rate hard" onClick={() => onRate(Rating.Hard)}>
                🤔 어려움<small>{intervals?.[Rating.Hard]}</small>
              </button>
              <button className="rate good" onClick={() => onRate(Rating.Good)}>
                🙂 알맞음<small>{intervals?.[Rating.Good]}</small>
              </button>
              <button className="rate easy" onClick={() => onRate(Rating.Easy)}>
                😎 쉬움<small>{intervals?.[Rating.Easy]}</small>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
