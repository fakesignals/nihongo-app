import { loadSettings } from './store'
import type { Word } from './types'

export const speechSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window

let voice: SpeechSynthesisVoice | null = null

function isJa(v: SpeechSynthesisVoice): boolean {
  return v.lang.replace('_', '-').toLowerCase().startsWith('ja')
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (!speechSupported) return null
  const list = speechSynthesis.getVoices().filter(isJa)
  if (!list.length) return null
  // 기기에 설치된 음성(iOS의 Kyoko 등)이 오프라인에서도 동작해서 우선
  return list.find(v => v.localService) ?? list[0]
}

if (speechSupported) {
  voice = pickVoice()
  // iOS·Chrome은 음성 목록을 비동기로 채움
  speechSynthesis.addEventListener('voiceschanged', () => { voice = pickVoice() })
}

/** 일본어 음성이 이 기기에 있는지 */
export function hasJaVoice(): boolean {
  if (!speechSupported) return false
  if (!voice) voice = pickVoice()
  return !!voice
}

/** 한자 오독을 피하려고 읽기(가나)가 있으면 그걸로 발음 */
export function speakText(w: Word): string {
  return w.reading?.trim() || w.jp
}

export function speak(text: string, rate?: number) {
  if (!speechSupported) return
  const t = text?.trim()
  if (!t) return
  // 연타했을 때 큐가 밀리지 않게 진행 중인 발화를 끊음
  if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel()
  if (!voice) voice = pickVoice()
  const u = new SpeechSynthesisUtterance(t)
  u.lang = 'ja-JP'
  if (voice) u.voice = voice
  u.rate = rate ?? loadSettings().speakRate
  speechSynthesis.speak(u)
}

export function stopSpeaking() {
  if (speechSupported) speechSynthesis.cancel()
}
