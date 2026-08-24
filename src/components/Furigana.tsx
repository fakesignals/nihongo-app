const KANJI_RE = /[㐀-鿿々〆]/

export function hasKanji(s: string): boolean {
  return KANJI_RE.test(s)
}

/**
 * 한자 위에 읽기를 얹는 후리가나 표기.
 * 読み가 単語와 공유하는 앞/뒤 가나(오쿠리가나)는 제외하고 한자 부분에만 루비를 단다.
 * 예) 食べる/たべる → 食(た)べる, 한자 없는 단어는 읽기 생략.
 */
export default function Furigana({ jp, reading }: { jp: string; reading: string }) {
  const w = jp.trim()
  const r = reading.trim()
  if (!r || r === w || !hasKanji(w)) return <>{w}</>

  let pre = 0
  while (pre < w.length && pre < r.length && w[pre] === r[pre]) pre++
  let suf = 0
  while (suf < w.length - pre && suf < r.length - pre && w[w.length - 1 - suf] === r[r.length - 1 - suf]) suf++

  const base = w.slice(pre, w.length - suf)
  const rt = r.slice(pre, r.length - suf)
  if (!base || !rt) return <ruby>{w}<rt>{r}</rt></ruby>

  return (
    <>
      {w.slice(0, pre)}
      <ruby>{base}<rt>{rt}</rt></ruby>
      {w.slice(w.length - suf)}
    </>
  )
}
