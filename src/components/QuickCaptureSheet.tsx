import { useRef, useState, type FormEvent } from 'react'
import { db } from '../db'
import { makeWord } from '../store'

/** 공부 흐름을 끊지 않고 표기만 먼저 모아두는 빠른 기록 시트 */
export default function QuickCaptureSheet({
  onClose, onDetailed, toast
}: {
  onClose: () => void
  onDetailed: () => void
  toast: (m: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [jp, setJp] = useState('')
  const [meaning, setMeaning] = useState('')
  const [saved, setSaved] = useState(0)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const word = jp.trim()
    if (!word || busy) return
    setBusy(true)
    try {
      const ko = meaning.trim()
      await db.words.add(makeWord({
        jp: word,
        meaning: ko,
        category: ko ? '듀오링고' : '미정리'
      }))
      setSaved(n => n + 1)
      setJp('')
      setMeaning('')
      toast(ko ? '단어를 담았어요' : '미정리 단어로 담았어요')
      requestAnimationFrame(() => inputRef.current?.focus())
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="sheet-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet quick-sheet" role="dialog" aria-modal="true">
        <div className="grab" />
        <div className="sheet-head">
          <div>
            <h3>빠르게 기록</h3>
            <p className="quick-subtitle">일본어만 적어도 돼요. 뜻은 나중에 정리할 수 있어요.</p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="닫기">×</button>
        </div>

        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>기억해 둘 일본어</label>
              <input
                ref={inputRef}
                required
                autoFocus
                value={jp}
                onChange={e => setJp(e.target.value)}
                placeholder="예: 間に合う"
                autoComplete="off"
              />
            </div>
            <div className="field">
              <label>뜻 — 몰라도 비워두세요</label>
              <input
                value={meaning}
                onChange={e => setMeaning(e.target.value)}
                placeholder="예: 시간에 맞다"
                autoComplete="off"
              />
            </div>
          </div>
          <button className="primary quick-save" type="submit" disabled={!jp.trim() || busy}>
            저장하고 계속
          </button>
        </form>

        <div className="quick-footer">
          <span>{saved ? `이번에 ${saved}개 기록` : '뜻 없는 단어는 복습에 나오지 않아요'}</span>
          <button type="button" onClick={onDetailed}>상세하게 추가</button>
        </div>
      </div>
    </div>
  )
}
