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
  /** 앱 화면 색상 테마 */
  theme: 'light' | 'dark'
  newPerDay: number
  mode: ReviewMode
  /** 단어장에서 뜻을 가리고 탭했을 때만 보여줌 */
  hideMeaning: boolean
  /** 복습에서 정답을 공개할 때 일본어 발음을 자동 재생 */
  autoSpeak: boolean
  /** 음성 재생 속도 (0.6~1.2) */
  speakRate: number
  /** 일본어 단어 글꼴 */
  jpFont: 'serif' | 'sans'
}
