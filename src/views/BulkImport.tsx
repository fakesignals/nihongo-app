import { useMemo, useState } from 'react'
import { db } from '../db'
import { parseWordLines } from '../parse'
import { makeWord, type WordInput } from '../store'
import type { Word } from '../types'
import Furigana from '../components/Furigana'

interface ParsedRow extends WordInput {
  duplicate: boolean
  incomplete: boolean
}

export default function BulkImport({ words, toast }: { words: Word[]; toast: (m: string) => void }) {
  const [text, setText] = useState('')
  const [category, setCategory] = useState('')

  const existing = useMemo(() => new Set(words.map(w => w.jp)), [words])
  const categories = useMemo(
    () => [...new Set(words.map(w => w.category || '기타'))].sort((a, b) => a.localeCompare(b, 'ko')),
    [words]
  )

  const fallbackCat = category.trim() || '듀오링고'

  const rows: ParsedRow[] = useMemo(() => {
    const seen = new Set<string>()
    return parseWordLines(text, fallbackCat).map(r => {
      const duplicate = existing.has(r.jp) || seen.has(r.jp)
      seen.add(r.jp)
      return { ...r, duplicate, incomplete: !r.meaning }
    })
  }, [text, existing, fallbackCat])

  const importable = rows.filter(r => !r.duplicate && !r.incomplete)
  // 카테고리를 줄에서 정한 게 있으면 미리보기에 보여준다
  const showCat = useMemo(() => new Set(rows.map(r => r.category)).size > 1, [rows])

  const doImport = async () => {
    if (!importable.length) return
    const newWords = importable.map(r => makeWord(r))
    await db.words.bulkAdd(newWords)
    toast(`${newWords.length}개 단어를 추가했어요`)
    setText('')
  }

  return (
    <section className="view">
      <div className="import-box">
        <h3>단어 한 번에 넣기</h3>
        <p className="hint">
          한 줄에 한 단어씩 붙여넣으세요. 구분은 탭·쉼표·<code>|</code>·공백 모두 인식해요.<br />
          <code>食べる たべる 먹다</code> / <code>食べる(たべる), 먹다</code> / <code>水 물</code>
        </p>
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
          placeholder={'食べる\tたべる\t먹다\n水\tみず\t물\n猫(ねこ) 고양이'}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="import-row">
          <button className="primary" style={{ flex: 1 }} disabled={!importable.length} onClick={doImport}>
            {!importable.length
              ? '추가'
              : showCat
                ? `${importable.length}개 추가`
                : `${importable[0].category}에 ${importable.length}개 추가`}
          </button>
        </div>

        {rows.length > 0 && (
          <div className="preview-list">
            {rows.map((r, i) => (
              <div key={i} className={`preview-item ${r.duplicate ? 'dup' : ''}`}>
                <b><Furigana jp={r.jp} reading={r.reading || ''} /></b>
                <span className="p-meaning">{r.meaning || '뜻 없음'}</span>
                {r.polite && <span className="p-sub">{r.polite}</span>}
                {showCat && <span className="p-cat">{r.category}</span>}
                {r.duplicate && <span className="p-flag">중복</span>}
                {!r.duplicate && r.incomplete && <span className="p-flag">뜻을 입력하세요</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
