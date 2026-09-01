import { useEffect, useState, type FormEvent } from 'react'
import { db } from '../db'
import type { Word } from '../types'

/** 빠르게 모아둔 미정리 단어를 한 장씩 완성하는 흐름 */
export default function DraftOrganizerSheet({
  words, onClose, toast
}: {
  words: Word[]
  onClose: () => void
  toast: (m: string) => void
}) {
  const [queue] = useState(() => words.filter(w => !w.meaning.trim()).map(w => w.id))
  const [index, setIndex] = useState(0)
  const [reading, setReading] = useState('')
  const [meaning, setMeaning] = useState('')
  const [category, setCategory] = useState('듀오링고')
  const current = words.find(w => w.id === queue[index])

  useEffect(() => {
    setReading(current?.reading ?? '')
    setMeaning(current?.meaning ?? '')
    setCategory(current?.category && current.category !== '미정리' ? current.category : '듀오링고')
  }, [current?.id])

  const advance = () => {
    if (index + 1 >= queue.length) {
      toast('미정리 단어를 모두 확인했어요')
      onClose()
    } else {
      setIndex(i => i + 1)
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!current || !meaning.trim()) return
    await db.words.update(current.id, {
      reading: reading.trim(),
      meaning: meaning.trim(),
      category: category.trim() || '듀오링고'
    })
    toast('복습할 단어로 옮겼어요')
    advance()
  }

  if (!current) return null

  return (
    <div className="sheet-backdrop">
      <div className="sheet draft-sheet" role="dialog" aria-modal="true">
        <div className="grab" />
        <div className="sheet-head">
          <div>
            <div className="draft-progress">미정리 {index + 1} / {queue.length}</div>
            <h3>뜻을 채워 주세요</h3>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="닫기">×</button>
        </div>

        <div className="draft-word">{current.jp}</div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>읽기 — 선택</label>
              <input value={reading} onChange={e => setReading(e.target.value)} placeholder="예: まにあう" />
            </div>
            <div className="field">
              <label>한국어 뜻</label>
              <input required autoFocus value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="예: 시간에 맞다" />
            </div>
            <div className="field">
              <label>카테고리</label>
              <input value={category} onChange={e => setCategory(e.target.value)} placeholder="듀오링고" />
            </div>
          </div>
          <div className="actions">
            <button type="button" className="soft-btn" onClick={advance}>나중에</button>
            <button type="submit" className="primary" disabled={!meaning.trim()}>저장하고 다음</button>
          </div>
        </form>
      </div>
    </div>
  )
}
