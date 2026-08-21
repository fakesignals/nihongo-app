Nihongo Pocket — iPhone용 일본어 기초노트

파일 구성
- index.html : 앱 본체
- manifest.json : 홈 화면 설치용 PWA 정보
- sw.js : 오프라인 캐시
- icon-180.png / icon-512.png : 앱 아이콘

아이폰에서 가장 안정적으로 쓰는 방법
1. 이 폴더 전체를 GitHub Pages / Netlify / Cloudflare Pages 같은 HTTPS 정적 호스팅에 올립니다.
2. iPhone Safari에서 주소를 엽니다.
3. 공유 버튼 → '홈 화면에 추가'를 누릅니다.
4. 이후 홈 화면 아이콘으로 실행하면 앱처럼 동작합니다.

주의
- index.html 파일을 iPhone '파일' 앱에서 직접 여는 방식은 브라우저 저장소와 PWA 설치가 제한될 수 있습니다.
- 단어 데이터는 해당 브라우저/기기의 localStorage에 저장되므로, 설정 → '백업 내보내기'를 가끔 사용해 주세요.
