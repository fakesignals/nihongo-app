import { circledNum, moraSplit, pitchHighs } from '../pitch'

/**
 * 고저 악센트를 교재식 선 그래프로 표시.
 * 마지막 ○는 뒤에 붙는 조사의 높이 — 평판형과 미고형을 구분해줌.
 */
export default function PitchLine({
  reading, accents, className = ''
}: {
  reading: string
  accents: number[]
  className?: string
}) {
  const moras = moraSplit(reading)
  if (!moras.length || !accents.length) return null

  const accent = Math.min(accents[0], moras.length)
  const highs = pitchHighs(moras.length, accent)
  const particleHigh = accent === 0

  return (
    <span className={`pitch ${className}`} aria-label={`고저 악센트 ${accent}형`}>
      <span className="pitch-num">{accents.map(circledNum).join('')}</span>
      {moras.map((m, i) => {
        const nextHigh = i === moras.length - 1 ? particleHigh : highs[i + 1]
        return (
          <span key={i} className={`pm ${highs[i] ? 'hi' : 'lo'} ${highs[i] && !nextHigh ? 'drop' : ''}`}>
            {m}
          </span>
        )
      })}
      <span className={`pm particle ${particleHigh ? 'hi' : 'lo'}`}>○</span>
    </span>
  )
}
