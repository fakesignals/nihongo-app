import { useState } from 'react'
import Furigana from './Furigana'
import { inAppBrowser } from '../share'
import { makeWord, mergeWords, type WordInput } from '../store'

/** 공유 링크로 받은 단어를 확인하고 단어장에 합칠지 묻는 시트 */
export default function ShareInbox({
  incoming, onClose, toast
}: {
  incoming: WordInput[]
  onClose: () => void
  toast: (m: string) => void
}) {
  const [busy, setBusy] = useState(false)

  const accept = async () => {
    setBusy(true)
    const { added, skipped } = await mergeWords(incoming.map(w => makeWord(w)))
    toast(
      added
        ? `단어 ${added}개를 담았어요${skipped ? ` (이미 있던 ${skipped}개는 건너뜀)` : ''}`
        : '모두 이미 가지고 있는 단어예요'
    )
    onClose()
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href)
      toast('링크를 복사했어요. Safari나 Chrome에 붙여넣어 주세요')
    } catch {
      toast('주소창의 링크를 길게 눌러 복사해 주세요')
    }
  }

  return (
    <div className="sheet-backdrop">
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="grab" />
        <div className="sheet-head">
          <h3>단어 {incoming.length}개를 받았어요</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {inAppBrowser && (
          <div className="warn-note">
            지금 메신저 안의 브라우저로 열려 있어요. 여기서 받으면 <b>홈 화면 앱에는 안 들어갑니다.</b>
            아래에서 링크를 복사해 Safari나 Chrome에서 다시 열어 주세요.
            <div className="settings-row" style={{ marginTop: 10 }}>
              <button className="soft-btn" onClick={copyLink}>링크 복사</button>
            </div>
          </div>
        )}

        <p className="sheet-note">
          내 단어장에 합쳐집니다. 이미 있는 단어는 건너뛰고, 학습 진도는 처음부터 시작해요.
        </p>

        <div className="share-list">
          {incoming.slice(0, 30).map((w, i) => (
            <div key={i} className="preview-item">
              <b><Furigana jp={w.jp} reading={w.reading || ''} /></b>
              <span className="p-meaning">{w.meaning}</span>
            </div>
          ))}
          {incoming.length > 30 && (
            <div className="preview-item"><span className="p-meaning">외 {incoming.length - 30}개…</span></div>
          )}
        </div>

        <div className="actions">
          <button className="primary" disabled={busy} onClick={accept}>단어장에 담기</button>
          <button className="danger" onClick={onClose}>안 받기</button>
        </div>
      </div>
    </div>
  )
}
