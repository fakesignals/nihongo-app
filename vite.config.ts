import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-180.png', 'icon-512.png'],
      manifest: {
        name: 'Nihongo Pocket — 일본어 기초노트',
        short_name: '일본어 노트',
        description: '듀오링고에서 배운 일본어를 FSRS 간격 반복으로 복습하는 개인 단어장',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#F6F3EC',
        theme_color: '#F6F3EC',
        lang: 'ko',
        icons: [
          { src: './icon-180.png', sizes: '180x180', type: 'image/png' },
          { src: './icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
