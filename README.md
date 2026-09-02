# Nihongo Pocket v2

듀오링고에서 배운 일본어를 **FSRS 간격 반복**으로 복습하는 개인 단어장 PWA.

- 스택: Vite + React + TypeScript
- 저장: IndexedDB (Dexie) — 기기 내 저장, JSON 백업/복원 지원
- 복습: [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) — Anki 최신 알고리즘
- 설치: iPhone Safari → 공유 → 홈 화면에 추가 (앱스토어 불필요)

## 개발

```bash
npm install
npm run dev          # 로컬 개발 서버
npm run dev -- --host  # 같은 와이파이의 아이폰에서 접속해 테스트
npm run build        # 타입체크 + 프로덕션 빌드 (dist/)
```

## 배포

`main`에 푸시하면 GitHub Actions가 자동으로 빌드해서 GitHub Pages로 배포한다
(`.github/workflows/deploy.yml`).

**최초 1회 설정**: GitHub 저장소 → Settings → Pages → Build and deployment →
Source를 **GitHub Actions**로 변경.

주소: https://fakesignals.github.io/nihongo-app/

## 데이터 이전

구버전(단일 파일 앱)을 같은 주소에서 쓰고 있었다면, 새 버전 첫 실행 때
localStorage의 데이터를 자동으로 IndexedDB로 가져온다. 구버전 JSON 백업 파일도
설정 → 백업 가져오기로 복원 가능.

구버전 코드는 `legacy/`에 보존되어 있다.

## Gemini 생활 예문 (선택 기능)

설정 → Gemini 생활 예문에서 Google AI Studio API 키를 저장하면 단어 편집 중
사용 가능한 Gemini 모델이 생활 예문 3개와 문장 전체의 히라가나 읽기를 제안한다.
생성된 예문은 단어와 함께 저장되며 앱의 예문 탭에서 모아 보고 음성으로 들을 수 있다.

키는 입력한 브라우저의 localStorage에만 저장된다. Git 저장소, JSON 백업,
PC → 폰 동기화에는 포함되지 않으므로 각 기기에서 따로 등록해야 한다.
공용 기기에는 저장하지 말고, 키에는 Gemini 이외의 권한을 부여하지 않는다.

## 데이터 출처

- 발음 음성: 기기 내장 음성 (Web Speech API). 별도 데이터 없음.
