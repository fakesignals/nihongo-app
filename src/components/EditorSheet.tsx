import { useMemo, useState, type FormEvent } from 'react'
import { db } from '../db'
import { makeWord } from '../store'
import type { Word } from '../types'

export default function EditorSheet({
  word, words, onClose, toast
}: {
  word: Word | null
  words: Word[]
  onClose: () => void
  toast: (m: string) => void
}) {
  const [jp, setJp] = useState(word?.jp ?? '')
  const [reading, setReading] = useState(word?.reading ?? '')
  const [meaning, setMeaning] = useState(word?.meaning ?? '')
  const [category, setCategory] = useState(word?.category ?? '')
  const [polite, setPolite] = useState(word?.polite ?? '')
  const [example, setExample] = useState(word?.example ?? '')

  const categories = useMemo(
    () => [...new Set(words.map(w => w.category || '기타'))].sort((a, b) => a.localeCompare(b, 'ko')),
    [words]
  )

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const data = { jp, reading, meaning, category, polite, example }
    if (word) {
      const jpChanged = word.jp !== jp.trim() || word.reading !== reading.trim()
      await db.words.update(word.id, {
        jp: jp.trim(), reading: reading.trim(), meaning: meaning.trim(),
        category: category.trim() || '기타', polite: polite.trim(), example: example.trim()
      })
      // 표기·읽기가 바뀌면 고저 악센트를 다시 조회하도록 지움
      if (jpChanged) await db.words.where('id').equals(word.id).modify(w => { delete w.accent })
      toast('수정했어요')
    } else {
      await db.words.add(makeWord(data))
      toast('단어를 추가했어요')
    }
    onClose()
  }

  const remove = async () => {
    if (!word) return
    if (confirm('이 단어를 삭제할까요? 학습 기록도 함께 사라져요.')) {
      await db.words.delete(word.id)
      toast('삭제했어요')
      onClose()
    }
  }

  return (
    <div className="sheet-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="grab" />
        <div className="sheet-head">
          <h3>{word ? '단어 수정' : '새 단어 추가'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="two">
              <div className="field"><label>일본어</label><input required autoFocus value={jp} onChange={e => setJp(e.target.value)} placeholder="例) 食べる" /></div>
              <div className="field"><label>읽기</label><input value={reading} onChange={e => setReading(e.target.value)} placeholder="たべる" /></div>
            </div>
            <div className="two">
              <div className="field"><label>한국어 뜻</label><input required value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="먹다" /></div>
              <div className="field"><label>카테고리</label><input list="editorCategoryList" value={category} onChange={e => setCategory(e.target.value)} placeholder="동사" /></div>
            </div>
            <datalist id="editorCategoryList">
              {categories.map(c => <option key={c} value={c} />)}
            </datalist>
            <div className="field"><label>정중형 / 메모</label><input value={polite} onChange={e => setPolite(e.target.value)} placeholder="食べます" /></div>
            <div className="field"><label>예문</label><textarea value={example} onChange={e => setExample(e.target.value)} placeholder={'ご飯を食べます。\n밥을 먹습니다.'} /></div>
          </div>
          <div className="actions">
            {word && <button type="button" className="danger" onClick={remove}>삭제</button>}
            <button className="primary" type="submit">저장</button>
          </div>
        </form>
      </div>
    </div>
  )
}
