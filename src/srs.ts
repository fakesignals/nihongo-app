import { fsrs, generatorParameters, createEmptyCard, Rating, State, type Card, type Grade } from 'ts-fsrs'

export const scheduler = fsrs(generatorParameters({ enable_fuzz: true }))
export { Rating, State }
export type { Card, Grade }

export function newCard(): Card {
  return createEmptyCard(new Date())
}

/** 평가에 따라 다음 카드 상태를 계산 */
export function rate(card: Card, grade: Grade): Card {
  return scheduler.repeat(reviveCard(card), new Date())[grade].card
}

/** 각 평가 버튼에 표시할 다음 복습 간격 미리보기 */
export function previewIntervals(card: Card): Record<Grade, string> {
  const now = new Date()
  const preview = scheduler.repeat(reviveCard(card), now)
  const out = {} as Record<Grade, string>
  for (const g of [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as Grade[]) {
    out[g] = formatInterval(preview[g].card.due.getTime() - now.getTime())
  }
  return out
}

/** JSON 복원 등으로 문자열이 된 날짜 필드를 Date로 되살림 */
export function reviveCard(card: Card): Card {
  return {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined
  }
}

export function formatInterval(ms: number): string {
  const min = Math.round(ms / 60000)
  if (min < 1) return '곧'
  if (min < 60) return `${min}분`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}시간`
  const day = Math.round(hr / 24)
  if (day < 31) return `${day}일`
  const month = Math.round(day / 30)
  if (month < 12) return `${month}개월`
  return `${Math.round(month / 12)}년`
}

/** 단어장 카드에 표시할 다음 복습 시점 라벨 */
export function dueLabel(word: { due: number; state: number }): string {
  if (word.state === State.New) return '새 단어'
  const diff = word.due - Date.now()
  if (diff <= 0) return '복습할 때!'
  return `${formatInterval(diff)} 후`
}
