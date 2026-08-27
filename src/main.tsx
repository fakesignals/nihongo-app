import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { applyJpFont, loadSettings } from './store'
import './styles.css'

// 걷어낸 피치 액센트 사전이 캐시에 남아 있으면(약 3MB) 정리
caches?.delete('pitch-dict').catch(() => {})

applyJpFont(loadSettings().jpFont)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
