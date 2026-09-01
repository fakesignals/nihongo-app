import { useEffect, useMemo, useState } from 'react'
import { db } from '../db'
import { parseWordLines } from '../parse'
import { makeWord, type WordInput } from '../store'
import type { Word } from '../types'
import Furigana from '../components/Furigana'

interface ParsedRow extends WordInput {
  key: string
  duplicate: boolean
  incomplete: boolean
}

const HAS_JAPANESE = /[\u3040-\u30ff\u3400-\u9fff々〆]/

export default function BulkImport({ words, toast }: { words: Word[]; toast: (m: string) => void }) {
  const [text, setText] = useState('')
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const existing = useMemo(() => new Set(words.map(w => w.jp)), [words])
  const categories = useMemo(
    () => [...new Set(words.map(w => w.category || '기타'))].sort((a, b) => a.localeCompare(b, 'ko')),
    [words]
  )

  const fallbackCat = category.trim() || '듀오링고'

  const rows: ParsedRow[] = useMemo(() => {
    const seen = new Set<string>()
    return parseWordLines(text, fallbackCat).map((r, i) => {
      const duplicate = existing.has(r.jp) || seen.has(r.jp)
      seen.add(r.jp)
      const incomplete = !r.meaning
      return { ...r, key: `${i}:${r.jp}`, category: incomplete ? '미정리' : r.category, duplicate, incomplete }
    })
  }, [text, existing, fallbackCat])

  useEffect(() => {
    setSelected(new Set(rows.filter(r => !r.duplicate).map(r => r.key)))
  }, [rows])

  const importable = rows.filter(r => !r.duplicate && selected.has(r.key))
  const draftCount = importable.filter(r => r.incomplete).length
  // 카테고리를 줄에서 정한 게 있으면 미리보기에 보여준다
  const showCat = useMemo(() => new Set(rows.map(r => r.category)).size > 1, [rows])

  const doImport = async () => {
    if (!importable.length) return
    const newWords = importable.map(r => makeWord(r))
    await db.words.bulkAdd(newWords)
    toast(
      draftCount
        ? `${newWords.length}개 저장 · 미정리 ${draftCount}개`
        : `${newWords.length}개 단어를 추가했어요`
    )
    setText('')
  }

  const pasteClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText()
      if (!clip.trim()) { toast('클립보드가 비어 있어요'); return }
      setText(prev => prev.trim() ? `${prev.trimEnd()}\n${clip}` : clip)
      toast('클립보드 내용을 가져왔어요')
    } catch {
      toast('입력칸을 길게 눌러 붙여넣어 주세요')
    }
  }

  const pastePhotoText = async () => {
    try {
      const clip = await navigator.clipboard.readText()
      if (!clip.trim()) { toast('클립보드가 비어 있어요'); return }
      const all = clip.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
      const japanese = all.filter(line => HAS_JAPANESE.test(line))
      if (!japanese.length) { toast('복사한 내용에서 일본어를 찾지 못했어요'); return }
      setText(prev => prev.trim() ? `${prev.trimEnd()}\n${japanese.join('\n')}` : japanese.join('\n'))
      const ignored = all.length - japanese.length
      toast(`일본어가 있는 줄 ${japanese.length}개를 가져왔어요${ignored ? ` · ${ignored}개 제외` : ''}`)
    } catch {
      toast('사진에서 텍스트를 복사한 뒤 입력칸에 붙여넣어 주세요')
    }
  }

  const toggleSelected = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <section className="view">
      <div className="import-box">
        <h3>단어 수집함</h3>
        <p className="hint">
          공부 중 적어둔 일본어를 한 줄에 하나씩 넣으세요. <b>뜻이 없어도 미정리 단어로 보관</b>합니다.<br />
          <code>食べる たべる 먹다</code> / <code>食べる(たべる), 먹다</code> / <code>水 물</code>
        </p>
        <div className="collector-actions">
          <button className="soft-btn" type="button" onClick={pasteClipboard}>클립보드에서 붙여넣기</button>
          <span>일본어만 여러 줄 붙여넣어도 됩니다</span>
        </div>
        <details className="photo-collect">
          <summary>듀오링고 스크린샷에서 가져오기</summary>
          <ol>
            <li>사진 앱에서 듀오링고 스크린샷을 엽니다.</li>
            <li>일본어를 길게 눌러 필요한 부분을 복사합니다.</li>
            <li>이 앱으로 돌아와 아래 버튼을 누릅니다.</li>
          </ol>
          <button className="soft-btn" type="button" onClick={pastePhotoText}>사진에서 복사한 일본어 가져오기</button>
          <p>한국어 안내처럼 일본어가 없는 줄은 자동으로 제외합니다. 아래 미리보기에서 저장하지 않을 줄을 체크 해제하세요.</p>
        </details>
        <details className="hint-more">
          <summary>엑셀에서 옮기거나 칸을 정확히 지정하려면</summary>
          <p className="hint">
            <b>첫 줄에 칸 이름</b>을 쓰면 그 순서대로 읽습니다. 쓸 수 있는 이름은<br />
            <code>일본어</code> <code>읽기</code> <code>뜻</code> <code>분류</code> <code>정중형</code> <code>예문</code>
            (영어 <code>jp reading meaning category polite example</code>도 됩니다)
          </p>
          <pre className="hint-sample">{
`일본어	읽기	뜻	정중형	예문
食べる	たべる	먹다	食べます	ご飯を食べる。
急ぐ	いそぐ	서두르다	急ぎます`
          }</pre>
          <p className="hint">
            <b><code>#</code>으로 시작하는 줄</b>은 그 아래 단어들의 카테고리가 됩니다.
            헤더에 <code>분류</code> 칸이 있으면 그게 이기고, 둘 다 없으면 아래 입력칸의 카테고리를 씁니다.
          </p>
          <pre className="hint-sample">{
`# 동사
食べる	たべる	먹다
# 명사
水	みず	물`
          }</pre>
        </details>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>카테고리 — 아래에 넣는 단어가 모두 여기로 들어갑니다</label>
          <input
            list="importCategoryList"
            placeholder="예: 명사, 동사 · 비우면 '듀오링고'"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
          <datalist id="importCategoryList">
            {categories.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <textarea
          className="import-textarea"
          placeholder={'間に合う\n食べる\tたべる\t먹다\n水\tみず\t물\n忘れた'}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="import-row">
          <button className="primary" style={{ flex: 1 }} disabled={!importable.length} onClick={doImport}>
            {!importable.length
              ? '추가'
              : showCat
                ? `${importable.length}개 저장${draftCount ? ` · 미정리 ${draftCount}` : ''}`
                : `${importable[0].category}에 ${importable.length}개 저장`}
          </button>
        </div>

        {rows.length > 0 && (
          <div className="preview-list">
            {rows.map(r => (
              <div key={r.key} className={`preview-item ${r.duplicate ? 'dup' : ''} ${!selected.has(r.key) ? 'excluded' : ''}`}>
                <label className="candidate-check" aria-label={r.duplicate ? '중복 단어' : '저장 여부'}>
                  <input
                    type="checkbox"
                    checked={!r.duplicate && selected.has(r.key)}
                    disabled={r.duplicate}
                    onChange={() => toggleSelected(r.key)}
                  />
                </label>
                <b><Furigana jp={r.jp} reading={r.reading || ''} /></b>
                <span className="p-meaning">{r.meaning || '뜻 없음'}</span>
                {r.polite && <span className="p-sub">{r.polite}</span>}
                {showCat && <span className="p-cat">{r.category}</span>}
                {r.duplicate && <span className="p-flag">중복</span>}
                {!r.duplicate && r.incomplete && <span className="p-flag draft">미정리로 보관</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
