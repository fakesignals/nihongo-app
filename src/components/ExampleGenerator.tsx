import { useEffect, useState } from 'react'
import { AI_KEY_CHANGED_EVENT, generateExamples, hasAiKey, type GeneratedExample } from '../ai'

export default function ExampleGenerator({
  jp, reading, meaning, selectedExamples, onReading, onChoose
}: {
  jp: string
  reading: string
  meaning: string
  selectedExamples: GeneratedExample[]
  onReading: (reading: string) => void
  onChoose: (example: GeneratedExample) => void
}) {
  const [examples, setExamples] = useState<GeneratedExample[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(() => hasAiKey())

  useEffect(() => {
    const refresh = () => setConnected(hasAiKey())
    window.addEventListener(AI_KEY_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    refresh()
    return () => {
      window.removeEventListener(AI_KEY_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  const generate = async () => {
    if (!jp.trim() || !meaning.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const result = await generateExamples({ jp, reading, meaning })
      setExamples(result.examples)
      if (!reading.trim() && result.reading.trim()) onReading(result.reading.trim())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const choose = (item: GeneratedExample) => {
    onChoose(item)
  }

  return (
    <div className="example-generator">
      <div className="example-gen-head">
        <div><b>Gemini 생활 예문</b><small>상황이 다른 예문 3개를 제안해요</small></div>
        <button
          type="button"
          className="soft-btn"
          disabled={!connected || !jp.trim() || !meaning.trim() || busy}
          onClick={generate}
        >
          {busy ? '만드는 중…' : examples.length ? '다시 만들기' : '생활 예문 만들기'}
        </button>
      </div>
      {!connected && <p className="example-gen-note">설정에서 Gemini API 키를 먼저 저장해 주세요.</p>}
      {error && <p className="example-gen-error">{error}</p>}
      {examples.length > 0 && (
        <div className="example-options">
          {examples.map((item, i) => (
            <button
              type="button"
              className={selectedExamples.some(saved => saved.jp === item.jp) ? 'selected' : ''}
              key={`${item.jp}-${i}`}
              onClick={() => choose(item)}
            >
              <span>{item.situation}</span>
              {item.reading && <small className="example-reading">{item.reading}</small>}
              <b>{item.jp}</b>
              <small>{item.ko}</small>
              <em>{selectedExamples.some(saved => saved.jp === item.jp) ? '추가됨 · 누르면 취소' : '이 예문 추가'}</em>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
