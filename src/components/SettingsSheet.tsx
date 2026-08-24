import { useEffect, useRef, useState } from 'react'
import { db } from '../db'
import { seedWords } from '../seed'
import { exportJSON, loadSettings, makeWord, parseBackup, saveSettings } from '../store'
import type { Word } from '../types'
import { hasJaVoice, speak, speechSupported } from '../speak'

export default function SettingsSheet({
  words, onClose, toast, onSettingsChange
}: {
  words: Word[]
  onClose: () => void
  toast: (m: string) => void
  onSettingsChange: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [newPerDay, setNewPerDay] = useState(() => loadSettings().newPerDay)
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [autoSpeak, setAutoSpeak] = useState(() => loadSettings().autoSpeak)
  const [speakRate, setSpeakRate] = useState(() => loadSettings().speakRate)
  const [voiceOk, setVoiceOk] = useState(() => hasJaVoice())
  const [showPitch, setShowPitch] = useState(() => loadSettings().showPitch)
  const withAccent = words.filter(w => w.accent?.length).length

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null))
  }, [])

  // 음성 목록은 비동기로 채워져서 한 박자 뒤에 다시 확인
  useEffect(() => {
    if (!speechSupported) return
    const check = () => setVoiceOk(hasJaVoice())
    speechSynthesis.addEventListener('voiceschanged', check)
    const t = setTimeout(check, 400)
    return () => { speechSynthesis.removeEventListener('voiceschanged', check); clearTimeout(t) }
  }, [])

  const doExport = () => {
    const blob = new Blob([exportJSON(words)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'nihongo-pocket-backup-' + new Date().toISOString().slice(0, 10) + '.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    toast('백업 파일을 만들었어요')
  }

  const doImport = async (file: File) => {
    try {
      const imported = parseBackup(await file.text())
      await db.words.clear()
      await db.words.bulkAdd(imported)
      toast(`백업에서 ${imported.length}개 단어를 복원했어요`)
      onClose()
    } catch {
      alert('올바른 Nihongo Pocket 백업 파일이 아닙니다.')
    }
  }

  const loadSeed = async () => {
    const existing = new Set(words.map(w => w.jp))
    const fresh = seedWords.filter(s => !existing.has(s.jp)).map(s => makeWord(s))
    if (!fresh.length) { toast('기본 단어가 이미 모두 들어있어요'); return }
    await db.words.bulkAdd(fresh)
    toast(`기본 단어 ${fresh.length}개를 추가했어요`)
  }

  const resetAll = async () => {
    if (confirm('모든 단어와 학습 기록을 삭제할까요? 백업하지 않았다면 복구할 수 없어요.')) {
      await db.words.clear()
      toast('모두 삭제했어요')
      onClose()
    }
  }

  const changeAutoSpeak = (v: boolean) => {
    setAutoSpeak(v)
    saveSettings({ ...loadSettings(), autoSpeak: v })
  }

  const changeSpeakRate = (r: number) => {
    setSpeakRate(r)
    saveSettings({ ...loadSettings(), speakRate: r })
    speak('はつおん', r)
  }

  const changeShowPitch = (v: boolean) => {
    setShowPitch(v)
    saveSettings({ ...loadSettings(), showPitch: v })
    onSettingsChange()
  }

  // accent 필드를 지우면 앱이 사전을 다시 훑어서 채움
  const rescanPitch = async () => {
    await db.words.toCollection().modify(w => { delete w.accent })
    toast('액센트를 다시 조회할게요')
  }

  const changeNewPerDay = (n: number) => {
    setNewPerDay(n)
    saveSettings({ ...loadSettings(), newPerDay: n })
  }

  return (
    <div className="sheet-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="grab" />
        <div className="sheet-head">
          <h3>설정 & 데이터</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-section">
          <h4>하루 신규 단어 수</h4>
          <p>[오늘 복습]에서 하루에 새로 배우기 시작하는 단어의 최대 개수예요.</p>
          <div className="settings-row">
            {[5, 10, 20, 50].map(n => (
              <button
                key={n}
                className="soft-btn"
                style={newPerDay === n ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' } : undefined}
                onClick={() => changeNewPerDay(n)}
              >
                {n}개
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h4>발음 (음성 재생)</h4>
          <p>
            {voiceOk
              ? '단어 옆 스피커 버튼을 누르면 읽어줍니다. 한자 오독을 피하려고 읽기(가나)를 우선으로 발음해요.'
              : '이 브라우저에서 일본어 음성을 찾지 못했어요. iPhone은 Safari로 열면 내장 음성(Kyoko)을 사용합니다.'}
          </p>
          <div className="settings-row">
            <button
              className="soft-btn"
              style={autoSpeak ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' } : undefined}
              onClick={() => changeAutoSpeak(!autoSpeak)}
            >
              {autoSpeak ? '정답 공개 시 자동 재생 ON' : '자동 재생 OFF'}
            </button>
          </div>
          <div className="settings-row">
            {([[0.7, '느리게'], [0.9, '보통'], [1.1, '빠르게']] as const).map(([r, label]) => (
              <button
                key={label}
                className="soft-btn"
                style={speakRate === r ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' } : undefined}
                onClick={() => changeSpeakRate(r)}
              >
                {label}
              </button>
            ))}
          </div>
          <button className="soft-btn" onClick={() => speak('こんにちは。にほんごのはつおんテストです。')}>
            테스트 재생
          </button>
        </div>

        <div className="settings-section">
          <h4>고저 악센트 (피치)</h4>
          <p>
            일본어 단어의 높낮이를 교재식 선 그래프로 보여줍니다. 단어 {words.length}개 중{' '}
            <b>{withAccent}개</b>에 정보가 있어요. 사전(약 3MB)은 처음 필요할 때 한 번만 내려받고
            이후에는 오프라인에서도 동작합니다.
          </p>
          <div className="settings-row">
            <button
              className="soft-btn"
              style={showPitch ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' } : undefined}
              onClick={() => changeShowPitch(!showPitch)}
            >
              {showPitch ? '피치 표시 ON' : '피치 표시 OFF'}
            </button>
            <button className="soft-btn" onClick={rescanPitch}>다시 조회</button>
          </div>
          <p className="credit">
            액센트 데이터: Kanjium (CC BY-SA 4.0) · EDRDG EDICT 기반
          </p>
        </div>

        <div className="settings-section">
          <h4>백업 & 복원</h4>
          <p>
            단어장은 이 기기 브라우저(IndexedDB)에 저장됩니다.
            {persisted === true ? ' 영구 저장이 허용된 상태예요.' : ' 가끔 JSON 백업을 받아두면 안전해요.'}
          </p>
          <div className="settings-row">
            <button className="soft-btn" onClick={doExport}>백업 내보내기</button>
            <button className="soft-btn" onClick={() => fileRef.current?.click()}>백업 가져오기</button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = '' }}
            />
          </div>
        </div>

        <div className="settings-section">
          <h4>기본 단어 세트</h4>
          <p>지시어·기초 동사·형용사 등 기본 단어 {seedWords.length}개를 추가합니다. 이미 있는 단어는 건너뛰어요.</p>
          <button className="soft-btn" onClick={loadSeed}>기본 단어 불러오기</button>
        </div>

        <div className="settings-section">
          <h4>초기화</h4>
          <p>모든 단어와 학습 기록을 삭제합니다.</p>
          <button className="soft-btn" onClick={resetAll}>전체 삭제</button>
        </div>

        <div className="ios-note">
          iPhone에서는 Safari로 이 주소를 연 뒤 공유 버튼 → <b>홈 화면에 추가</b>를 누르면 앱처럼 쓸 수 있어요.
          구버전 앱을 쓰고 있었다면 첫 실행 때 데이터를 자동으로 가져옵니다.
        </div>
      </div>
    </div>
  )
}
