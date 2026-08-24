import { speak, speechSupported } from '../speak'

export default function Speaker({
  text, className = '', label = '발음 듣기'
}: {
  text: string
  className?: string
  label?: string
}) {
  if (!speechSupported || !text.trim()) return null
  return (
    <button
      type="button"
      className={`speaker ${className}`}
      aria-label={label}
      onClick={e => { e.stopPropagation(); speak(text) }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6.5 9H3v6h3.5L11 19z" fill="currentColor" stroke="none" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
    </button>
  )
}
