import { useEffect, useMemo, useRef, useState } from 'react'
import { db } from '../db'
import { seedWords } from '../seed'
import {
  connectLinkFor, createGist, extractGistId, fingerprint, loadCloud, pullAndMerge,
  pushGist, saveCloud, type CloudConfig
} from '../cloud'
import { decodeShare, encodeShare, extractCode, LINK_LIMIT, shareLinkFor } from '../share'
import { exportJSON, loadSettings, makeWord, mergeWords, parseBackup, saveSettings } from '../store'
import type { Settings, Word } from '../types'
import { hasJaVoice, speak, speechSupported } from '../speak'

export default function SettingsSheet({
  words, onClose, toast
}: {
  words: Word[]
  onClose: () => void
  toast: (m: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [newPerDay, setNewPerDay] = useState(() => loadSettings().newPerDay)
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [autoSpeak, setAutoSpeak] = useState(() => loadSettings().autoSpeak)
  const [speakRate, setSpeakRate] = useState(() => loadSettings().speakRate)
  const [voiceOk, setVoiceOk] = useState(() => hasJaVoice())
  const [scope, setScope] = useState('all')
  const [pasted, setPasted] = useState('')
  const [cloud, setCloud] = useState<CloudConfig | null>(() => loadCloud())
  const [token, setToken] = useState('')
  const [pastedGist, setPastedGist] = useState('')
  const [busy, setBusy] = useState(false)
  const [jpFont, setJpFont] = useState<Settings['jpFont']>(() => loadSettings().jpFont)

  const categories = useMemo(
    () => [...new Set(words.map(w => w.category))].sort((a, b) => a.localeCompare(b, 'ko')),
    [words]
  )
  const shared = useMemo(() => {
    if (scope === 'all') return words
    if (scope === 'fav') return words.filter(w => w.fav)
    return words.filter(w => w.category === scope)
  }, [words, scope])

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

  const today = () => new Date().toISOString().slice(0, 10)

  const download = (json: string, name: string) => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  const doExport = () => {
    download(exportJSON(words), `nihongo-pocket-backup-${today()}.json`)
    toast('백업 파일을 만들었어요')
  }

  const shareLink = async () => {
    if (!shared.length) { toast('공유할 단어가 없어요'); return }
    const url = shareLinkFor(await encodeShare(shared))
    if (url.length > LINK_LIMIT) {
      alert(
        `단어 ${shared.length}개는 링크에 담기엔 많아요.\n` +
        '공유할 범위를 좁히거나 [파일로 보내기]를 사용해 주세요.'
      )
      return
    }
    const text = `일본어 단어 ${shared.length}개를 보냈어요. 링크를 열면 단어장에 담을 수 있어요.`
    try {
      if (navigator.share) { await navigator.share({ title: '일본어 단어 공유', text, url }); return }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(url)
      toast('링크를 복사했어요. 붙여넣어 보내세요')
    } catch {
      alert(url)
    }
  }

  const shareFile = async () => {
    if (!shared.length) { toast('공유할 단어가 없어요'); return }
    // 받는 사람은 학습 진도를 처음부터 시작해야 하므로 진도는 빼고 보냄
    const json = exportJSON(shared, false)
    const name = `일본어단어-${shared.length}개-${today()}.json`
    const file = new File([json], name, { type: 'application/json' })
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: '일본어 단어 공유' }); return }
      catch (e) { if ((e as Error).name === 'AbortError') return }
    }
    download(json, name)
    toast('파일을 만들었어요. 카톡 등으로 보내주세요')
  }

  const receiveLink = async () => {
    const code = extractCode(pasted)
    if (!code) { alert('공유 링크를 붙여넣어 주세요.'); return }
    let incoming
    try {
      incoming = await decodeShare(code)
    } catch {
      alert('링크를 읽지 못했어요. 전체가 복사됐는지 확인해 주세요.')
      return
    }
    if (!incoming.length) { toast('링크에 담긴 단어가 없어요'); return }
    if (!confirm(`단어 ${incoming.length}개를 단어장에 담을까요?`)) return
    const { added, skipped } = await mergeWords(incoming.map(w => makeWord(w)))
    setPasted('')
    toast(
      added
        ? `단어 ${added}개를 담았어요${skipped ? ` (중복 ${skipped}개 건너뜀)` : ''}`
        : '모두 이미 가지고 있는 단어예요'
    )
    if (added) onClose()
  }

  const doImport = async (file: File) => {
    try {
      const { added, skipped } = await mergeWords(parseBackup(await file.text()))
      toast(
        added
          ? `단어 ${added}개를 담았어요${skipped ? ` (중복 ${skipped}개 건너뜀)` : ''}`
          : '모두 이미 가지고 있는 단어예요'
      )
      if (added) onClose()
    } catch {
      alert('올바른 Nihongo Pocket 파일이 아닙니다.')
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

  const changeNewPerDay = (n: number) => {
    setNewPerDay(n)
    saveSettings({ ...loadSettings(), newPerDay: n })
  }

  const changeJpFont = (f: Settings['jpFont']) => {
    setJpFont(f)
    saveSettings({ ...loadSettings(), jpFont: f }) // saveSettings가 문서에 바로 반영한다
  }

  // ---- PC → 폰 자동 전송 ----
  const startSending = async () => {
    const t = token.trim()
    if (!t) { alert('GitHub 토큰을 붙여넣어 주세요.'); return }
    setBusy(true)
    try {
      const gistId = await createGist(t, exportJSON(words, false))
      saveCloud({ gistId, token: t, pushedHash: fingerprint(exportJSON(words, false)), lastSync: Date.now() })
      setCloud(loadCloud())
      setToken('')
      toast('보관함을 만들었어요. 연결 링크를 폰으로 보내세요')
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const copyConnectLink = async () => {
    if (!cloud) return
    const url = connectLinkFor(cloud.gistId)
    try {
      if (navigator.share) { await navigator.share({ title: 'Nihongo Pocket 연결', url }); return }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(url)
      toast('연결 링크를 복사했어요')
    } catch {
      alert(url)
    }
  }

  const connectReceiver = async () => {
    const id = extractGistId(pastedGist)
    if (!id) { alert('연결 링크를 붙여넣어 주세요.'); return }
    setBusy(true)
    try {
      const { added } = await pullAndMerge(id)
      saveCloud({ gistId: id, lastSync: Date.now() })
      setCloud(loadCloud())
      setPastedGist('')
      toast(added ? `연결했어요. 단어 ${added}개를 받았어요` : '연결했어요')
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const syncNow = async () => {
    if (!cloud) return
    setBusy(true)
    try {
      if (cloud.token) {
        const content = exportJSON(words, false)
        await pushGist(cloud.gistId, cloud.token, content)
        saveCloud({ ...cloud, pushedHash: fingerprint(content), lastSync: Date.now() })
        toast(`단어 ${words.length}개를 올렸어요`)
      } else {
        const { added } = await pullAndMerge(cloud.gistId)
        saveCloud({ ...cloud, lastSync: Date.now() })
        toast(added ? `새 단어 ${added}개를 받았어요` : '새로 온 단어는 없어요')
      }
      setCloud(loadCloud())
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const disconnect = () => {
    if (!confirm('연결을 끊을까요? 이미 받은 단어는 그대로 남습니다.')) return
    saveCloud(null)
    setCloud(null)
    toast('연결을 끊었어요')
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
                className={`soft-btn ${newPerDay === n ? 'active' : ''}`}
                onClick={() => changeNewPerDay(n)}
              >
                {n}개
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h4>단어 글꼴</h4>
          <p>일본어 단어를 어떤 글씨체로 보여줄지 고릅니다. 한국어 부분은 그대로예요.</p>
          <div className="settings-row">
            {([['serif', '명조체', '食べる'], ['sans', '고딕체', '食べる']] as const).map(([f, label, sample]) => (
              <button
                key={f}
                className={`soft-btn font-pick ${jpFont === f ? 'active' : ''}`}
                onClick={() => changeJpFont(f)}
              >
                <span style={{ fontFamily: f === 'serif' ? 'var(--jp-serif)' : 'var(--jp-sans)' }}>{sample}</span>
                {label}
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
              className={`soft-btn ${autoSpeak ? 'active' : ''}`}
              onClick={() => changeAutoSpeak(!autoSpeak)}
            >
              {autoSpeak ? '정답 공개 시 자동 재생 ON' : '자동 재생 OFF'}
            </button>
          </div>
          <div className="settings-row">
            {([[0.7, '느리게'], [0.9, '보통'], [1.1, '빠르게']] as const).map(([r, label]) => (
              <button
                key={label}
                className={`soft-btn ${speakRate === r ? 'active' : ''}`}
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
          <h4>PC → 폰 자동 전송</h4>
          {!cloud ? (
            <>
              <p>
                PC에서 단어를 넣으면 자동으로 보관함에 올라가고, 폰은 앱을 열 때 받아옵니다.
                <b>PC에서 먼저</b> 보관함을 만든 뒤, 나온 연결 링크를 폰에서 열면 끝이에요.
              </p>
              <div className="field" style={{ marginBottom: 10 }}>
                <label>① 이 기기(PC)를 보내는 쪽으로</label>
                <input
                  type="password"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="GitHub 토큰 붙여넣기"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <button className="soft-btn" disabled={busy} onClick={startSending}>보관함 만들기</button>
              <p style={{ margin: '9px 0 14px' }}>
                토큰은 <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
                GitHub 토큰 만들기</a>에서 <b>Account permissions → Gists → Read and write</b>만 켜서 만드세요.
                저장소 권한은 주지 마세요. 토큰은 이 브라우저에만 저장되고 링크나 보관함에는 들어가지 않습니다.
              </p>
              <div className="field" style={{ marginBottom: 10 }}>
                <label>② 이 기기(폰)를 받는 쪽으로</label>
                <input
                  value={pastedGist}
                  onChange={e => setPastedGist(e.target.value)}
                  placeholder="PC에서 받은 연결 링크"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </div>
              <button className="soft-btn" disabled={busy} onClick={connectReceiver}>연결하기</button>
            </>
          ) : (
            <>
              <p>
                {cloud.token
                  ? '이 기기가 보내는 쪽이에요. 단어를 바꾸면 몇 초 뒤 자동으로 올라갑니다.'
                  : '이 기기는 받는 쪽이에요. 앱을 열 때마다 새 단어를 받아옵니다.'}
                {cloud.lastSync
                  ? ` 마지막 ${cloud.token ? '전송' : '수신'}: ${new Date(cloud.lastSync).toLocaleString('ko-KR')}`
                  : ''}
              </p>
              <div className="settings-row">
                {cloud.token && (
                  <button className="soft-btn" onClick={copyConnectLink}>연결 링크 보내기</button>
                )}
                <button className="soft-btn" disabled={busy} onClick={syncNow}>
                  {cloud.token ? '지금 올리기' : '지금 받기'}
                </button>
                <button className="soft-btn" onClick={disconnect}>연결 끊기</button>
              </div>
              <p style={{ margin: '11px 0 0' }}>
                받는 쪽에서 지운 단어는 다시 열 때 또 받아옵니다. PC에서 지운 것도 폰에서 자동으로 지워지지는 않아요.
              </p>
            </>
          )}
        </div>

        <div className="settings-section">
          <h4>가족과 공유</h4>
          <p>
            고른 단어를 링크나 파일로 보내면, 받는 사람 단어장에 <b>합쳐집니다</b>.
            이미 있는 단어는 건너뛰고 학습 진도는 서로 따로 쌓여요.
          </p>
          <div className="field" style={{ marginBottom: 10 }}>
            <label>보낼 범위</label>
            <select value={scope} onChange={e => setScope(e.target.value)}>
              <option value="all">전체 단어 ({words.length}개)</option>
              <option value="fav">즐겨찾기만 ({words.filter(w => w.fav).length}개)</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat} ({words.filter(w => w.category === cat).length}개)
                </option>
              ))}
            </select>
          </div>
          <div className="settings-row">
            <button className="soft-btn" onClick={shareLink}>링크로 보내기</button>
            <button className="soft-btn" onClick={shareFile}>파일로 보내기</button>
          </div>
          <p style={{ margin: '11px 0 0' }}>
            링크가 가장 간편해요. 단어가 아주 많으면 링크가 길어지니 그때는 파일로 보내세요.
          </p>
        </div>

        <div className="settings-section">
          <h4>공유받은 링크로 담기</h4>
          <p>
            받은 링크를 눌러도 되지만, 메신저 안에서 열리면 홈 화면 앱과 저장소가 달라질 수 있어요.
            그럴 땐 링크를 복사해 여기에 붙여넣으면 <b>이 앱에 확실히</b> 담깁니다.
          </p>
          <div className="field" style={{ marginBottom: 10 }}>
            <input
              value={pasted}
              onChange={e => setPasted(e.target.value)}
              placeholder="받은 링크를 붙여넣으세요"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
          <button className="soft-btn" onClick={receiveLink}>링크에서 단어 담기</button>
        </div>

        <div className="settings-section">
          <h4>백업 & 복원</h4>
          <p>
            단어장은 이 기기 브라우저(IndexedDB)에 저장됩니다.
            {persisted === true ? ' 영구 저장이 허용된 상태예요.' : ' 가끔 JSON 백업을 받아두면 안전해요.'}
          </p>
          <div className="settings-row">
            <button className="soft-btn" onClick={doExport}>백업 내보내기</button>
            <button className="soft-btn" onClick={() => fileRef.current?.click()}>파일 가져오기</button>
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
