# nihongo-app - 일본어 학습 웹앱

## 프로젝트 개요
듀오링고 스타일의 일본어(히라가나/가타카나) 학습 웹앱.
완전 초심자를 위해 설계됨. React + Vite 기반.

## 기술 스택
- **프레임워크**: React 19 + Vite 8
- **스타일**: 순수 CSS (App.css, index.css)
- **상태 관리**: React hooks + localStorage 저장
- **TTS**: Web Speech API (일본어 음성 자동 탐색)
- **사운드**: Web Audio API (정답/오답 효과음)

## 실행 방법
```bash
cd C:\zz_myWork\nihongo-app
npm run dev          # 로컬 실행
npx vite --host      # 같은 와이파이에서 핸드폰 접속 가능
npm run build        # 프로덕션 빌드
```

## 프로젝트 구조
```
src/
├── App.jsx                    # 메인 앱 (phase 기반 라우팅)
├── App.css                    # 전체 스타일
├── index.css                  # 글로벌 스타일 (다크 테마)
├── main.jsx                   # 엔트리포인트
├── data/
│   └── lessons.js             # 히라가나/가타카나/단어/문장 데이터
│                                (각 글자에 exWord, exMeaning, exRomaji 포함)
├── hooks/
│   ├── useGameState.js        # XP, 스트릭, 하트, 레슨 완료, 틀린문제 관리
│   └── useSound.js            # TTS + 효과음 (일본어 음성 자동 탐색)
├── components/
│   ├── Header.jsx             # 상단바 (XP, 스트릭, 하트, 레벨)
│   ├── LessonMap.jsx          # 메인 화면 (학습 도구 그리드 + 레슨 맵)
│   ├── KanaChart.jsx          # 50음도 전체 차트
│   ├── LearnPhase.jsx         # 학습 단계 (소개 → 미니퀴즈 → 예시단어 퀴즈)
│   ├── Quiz.jsx               # 퀴즈 단계 (선택형 + 듣기)
│   ├── CardStudy.jsx          # 플립 카드 학습 (5장씩, 히라가나/가타카나 탭)
│   ├── SpeedQuiz.jsx          # 스피드 퀴즈 (시간제한, 콤보, 최고기록)
│   ├── ConfusableQuiz.jsx     # 헷갈리는 글자 비교 (15쌍, 차이점 팁)
│   ├── MatchingGame.jsx       # 히라가나↔가타카나 짝 맞추기 게임
│   ├── WritingPractice.jsx    # 캔버스 쓰기 연습 (가이드 투명도 조절)
│   ├── WeakReview.jsx         # 약점 복습 (틀린 글자 집중 연습)
│   └── questions/
│       ├── MultipleChoice.jsx # 4지선다
│       ├── TypeAnswer.jsx     # 타이핑 답변
│       ├── SentenceBuilder.jsx# 문장 조립 (드래그)
│       └── ListenAndChoose.jsx# 듣기 퀴즈
```

## 핵심 기능

### 1. 학습 코스 (레슨 맵)
- 히라가나 8레슨 (모음 → か행 → さ행 → ... → や·ら·わ행)
- 가타카나 기초 1레슨
- 기초 단어 / 문장 만들기 레슨
- 순차 잠금 해제 방식
- 흐름: 50음도 차트 → 학습(소개+미니퀴즈) → 퀴즈 → 레슨 완료

### 2. 학습 도구 (6가지)
- **카드 외우기**: 플립 카드 5장씩, 뒷면에 발음+예시단어+뜻, TTS 자동재생
- **쓰기 연습**: Canvas 위에 손가락/마우스로 글자 쓰기, 가이드 글자 오버레이
- **스피드 퀴즈**: 시간 내 발음 맞추기, 콤보 보너스, 최고기록 localStorage 저장
- **헷갈리는 글자**: シvsツ, はvsほ 등 15쌍 비교 + 구분 팁 + 퀴즈
- **짝 맞추기**: 히라가나↔가타카나 매칭 게임 (5쌍씩 라운드)
- **약점 복습**: 틀린 글자만 모아서 집중 연습, 예시단어 힌트

### 3. 게이미피케이션
- XP (정답당 10XP)
- 레벨 (100XP당 1레벨업)
- 데일리 스트릭 (연속 출석)
- 하트 시스템 (5개, 레슨 완료 시 리셋)
- 레슨 50% 이상 정답 시 통과

### 4. 데이터 특징
- 모든 히라가나/가타카나에 **예시 단어** 포함
  - 예: あ → あめ(비), ア → アイス(아이스크림)
- 예시 단어로 TTS 재생 (단일 글자보다 잘 들림)
- localStorage로 진행상황 자동 저장

## 현재 상태
- 빌드 정상 (에러 없음)
- 모든 기능 구현 완료
- Vercel 배포 아직 안 함 (GitHub 연결 필요)
- 다크 테마 (듀오링고 다크모드 느낌)

## 다음에 할 수 있는 것들
- Vercel 배포 (공개 URL 생성)
- 가타카나 레슨 확장 (현재 모음만 → 전체)
- N5 단어/문법 레슨 추가
- 획순 애니메이션 (KanjiVG 데이터 활용)
- PWA 변환 (오프라인 지원, 홈 화면 설치)
- 학습 통계 대시보드
- 복습 알림 시스템

## 설계 결정 메모
- phase 기반 라우팅 (react-router 안 씀 → 심플하게)
- 히라가나 레슨 → 먼저 50음도 차트 보여주고 → 학습 → 퀴즈 순서
- 학습 단계에서 새 글자 소개 → 바로 미니퀴즈 (순서대로 넘기기 X, 랜덤)
- TTS: speechSynthesis.cancel() 호출 후 speak (겹침 방지)
- 일본어 voice 자동 탐색 (onvoiceschanged)
