import type { Card } from 'ts-fsrs'

export interface Word {
  id: string
  jp: string
  reading: string
  meaning: string
  category: string
  polite: string
  example: string
  fav: 0 | 1
  createdAt: number
  card: Card
  // card.due / card.state 미러 — IndexedDB 인덱스 쿼리용
  due: number
  state: number
}

export type ReviewMode = 'jp-ko' | 'ko-jp'
export type ReviewScope = 'today' | 'fav' | 'all'

export interface Settings {
  newPerDay: number
  mode: ReviewMode
}
