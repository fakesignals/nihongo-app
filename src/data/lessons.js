// 히라가나 데이터 - 예시 단어 포함
export const hiragana = [
  // 모음
  { kana: 'あ', romaji: 'a', type: 'hiragana', group: '모음', exWord: 'あめ', exMeaning: '비', exRomaji: 'ame' },
  { kana: 'い', romaji: 'i', type: 'hiragana', group: '모음', exWord: 'いぬ', exMeaning: '강아지', exRomaji: 'inu' },
  { kana: 'う', romaji: 'u', type: 'hiragana', group: '모음', exWord: 'うみ', exMeaning: '바다', exRomaji: 'umi' },
  { kana: 'え', romaji: 'e', type: 'hiragana', group: '모음', exWord: 'えき', exMeaning: '역', exRomaji: 'eki' },
  { kana: 'お', romaji: 'o', type: 'hiragana', group: '모음', exWord: 'おかし', exMeaning: '과자', exRomaji: 'okashi' },
  // か행
  { kana: 'か', romaji: 'ka', type: 'hiragana', group: 'か행', exWord: 'かさ', exMeaning: '우산', exRomaji: 'kasa' },
  { kana: 'き', romaji: 'ki', type: 'hiragana', group: 'か행', exWord: 'きもの', exMeaning: '기모노', exRomaji: 'kimono' },
  { kana: 'く', romaji: 'ku', type: 'hiragana', group: 'か행', exWord: 'くるま', exMeaning: '자동차', exRomaji: 'kuruma' },
  { kana: 'け', romaji: 'ke', type: 'hiragana', group: 'か행', exWord: 'けしゴム', exMeaning: '지우개', exRomaji: 'keshigomu' },
  { kana: 'こ', romaji: 'ko', type: 'hiragana', group: 'か행', exWord: 'こども', exMeaning: '아이', exRomaji: 'kodomo' },
  // さ행
  { kana: 'さ', romaji: 'sa', type: 'hiragana', group: 'さ행', exWord: 'さくら', exMeaning: '벚꽃', exRomaji: 'sakura' },
  { kana: 'し', romaji: 'shi', type: 'hiragana', group: 'さ행', exWord: 'しろ', exMeaning: '흰색', exRomaji: 'shiro' },
  { kana: 'す', romaji: 'su', type: 'hiragana', group: 'さ행', exWord: 'すし', exMeaning: '초밥', exRomaji: 'sushi' },
  { kana: 'せ', romaji: 'se', type: 'hiragana', group: 'さ행', exWord: 'せんせい', exMeaning: '선생님', exRomaji: 'sensei' },
  { kana: 'そ', romaji: 'so', type: 'hiragana', group: 'さ행', exWord: 'そら', exMeaning: '하늘', exRomaji: 'sora' },
  // た행
  { kana: 'た', romaji: 'ta', type: 'hiragana', group: 'た행', exWord: 'たまご', exMeaning: '달걀', exRomaji: 'tamago' },
  { kana: 'ち', romaji: 'chi', type: 'hiragana', group: 'た행', exWord: 'ちず', exMeaning: '지도', exRomaji: 'chizu' },
  { kana: 'つ', romaji: 'tsu', type: 'hiragana', group: 'た행', exWord: 'つき', exMeaning: '달', exRomaji: 'tsuki' },
  { kana: 'て', romaji: 'te', type: 'hiragana', group: 'た행', exWord: 'てがみ', exMeaning: '편지', exRomaji: 'tegami' },
  { kana: 'と', romaji: 'to', type: 'hiragana', group: 'た행', exWord: 'とり', exMeaning: '새', exRomaji: 'tori' },
  // な행
  { kana: 'な', romaji: 'na', type: 'hiragana', group: 'な행', exWord: 'なつ', exMeaning: '여름', exRomaji: 'natsu' },
  { kana: 'に', romaji: 'ni', type: 'hiragana', group: 'な행', exWord: 'にく', exMeaning: '고기', exRomaji: 'niku' },
  { kana: 'ぬ', romaji: 'nu', type: 'hiragana', group: 'な행', exWord: 'ぬいぐるみ', exMeaning: '인형', exRomaji: 'nuigurumi' },
  { kana: 'ね', romaji: 'ne', type: 'hiragana', group: 'な행', exWord: 'ねこ', exMeaning: '고양이', exRomaji: 'neko' },
  { kana: 'の', romaji: 'no', type: 'hiragana', group: 'な행', exWord: 'のり', exMeaning: '김', exRomaji: 'nori' },
  // は행
  { kana: 'は', romaji: 'ha', type: 'hiragana', group: 'は행', exWord: 'はな', exMeaning: '꽃', exRomaji: 'hana' },
  { kana: 'ひ', romaji: 'hi', type: 'hiragana', group: 'は행', exWord: 'ひと', exMeaning: '사람', exRomaji: 'hito' },
  { kana: 'ふ', romaji: 'fu', type: 'hiragana', group: 'は행', exWord: 'ふね', exMeaning: '배', exRomaji: 'fune' },
  { kana: 'へ', romaji: 'he', type: 'hiragana', group: 'は행', exWord: 'へや', exMeaning: '방', exRomaji: 'heya' },
  { kana: 'ほ', romaji: 'ho', type: 'hiragana', group: 'は행', exWord: 'ほし', exMeaning: '별', exRomaji: 'hoshi' },
  // ま행
  { kana: 'ま', romaji: 'ma', type: 'hiragana', group: 'ま행', exWord: 'まど', exMeaning: '창문', exRomaji: 'mado' },
  { kana: 'み', romaji: 'mi', type: 'hiragana', group: 'ま행', exWord: 'みず', exMeaning: '물', exRomaji: 'mizu' },
  { kana: 'む', romaji: 'mu', type: 'hiragana', group: 'ま행', exWord: 'むし', exMeaning: '벌레', exRomaji: 'mushi' },
  { kana: 'め', romaji: 'me', type: 'hiragana', group: 'ま행', exWord: 'めがね', exMeaning: '안경', exRomaji: 'megane' },
  { kana: 'も', romaji: 'mo', type: 'hiragana', group: 'ま행', exWord: 'もも', exMeaning: '복숭아', exRomaji: 'momo' },
  // や행
  { kana: 'や', romaji: 'ya', type: 'hiragana', group: 'や행', exWord: 'やま', exMeaning: '산', exRomaji: 'yama' },
  { kana: 'ゆ', romaji: 'yu', type: 'hiragana', group: 'や행', exWord: 'ゆき', exMeaning: '눈', exRomaji: 'yuki' },
  { kana: 'よ', romaji: 'yo', type: 'hiragana', group: 'や행', exWord: 'よる', exMeaning: '밤', exRomaji: 'yoru' },
  // ら행
  { kana: 'ら', romaji: 'ra', type: 'hiragana', group: 'ら행', exWord: 'らーめん', exMeaning: '라멘', exRomaji: 'raamen' },
  { kana: 'り', romaji: 'ri', type: 'hiragana', group: 'ら행', exWord: 'りんご', exMeaning: '사과', exRomaji: 'ringo' },
  { kana: 'る', romaji: 'ru', type: 'hiragana', group: 'ら행', exWord: 'るす', exMeaning: '부재', exRomaji: 'rusu' },
  { kana: 'れ', romaji: 're', type: 'hiragana', group: 'ら행', exWord: 'れいぞうこ', exMeaning: '냉장고', exRomaji: 'reizouko' },
  { kana: 'ろ', romaji: 'ro', type: 'hiragana', group: 'ら행', exWord: 'ろうそく', exMeaning: '양초', exRomaji: 'rousoku' },
  // わ행
  { kana: 'わ', romaji: 'wa', type: 'hiragana', group: 'わ행', exWord: 'わたし', exMeaning: '나', exRomaji: 'watashi' },
  { kana: 'を', romaji: 'wo', type: 'hiragana', group: 'わ행', exWord: 'みずをのむ', exMeaning: '물을 마시다', exRomaji: 'mizu wo nomu' },
  { kana: 'ん', romaji: 'n', type: 'hiragana', group: 'わ행', exWord: 'にほん', exMeaning: '일본', exRomaji: 'nihon' },
];

// 가타카나 데이터 - 외래어 예시 포함
export const katakana = [
  { kana: 'ア', romaji: 'a', type: 'katakana', group: '모음', exWord: 'アイス', exMeaning: '아이스크림', exRomaji: 'aisu' },
  { kana: 'イ', romaji: 'i', type: 'katakana', group: '모음', exWord: 'インターネット', exMeaning: '인터넷', exRomaji: 'intaanetto' },
  { kana: 'ウ', romaji: 'u', type: 'katakana', group: '모음', exWord: 'ウイルス', exMeaning: '바이러스', exRomaji: 'uirusu' },
  { kana: 'エ', romaji: 'e', type: 'katakana', group: '모음', exWord: 'エレベーター', exMeaning: '엘리베이터', exRomaji: 'erebeetaa' },
  { kana: 'オ', romaji: 'o', type: 'katakana', group: '모음', exWord: 'オレンジ', exMeaning: '오렌지', exRomaji: 'orenji' },
  { kana: 'カ', romaji: 'ka', type: 'katakana', group: 'カ행', exWord: 'カメラ', exMeaning: '카메라', exRomaji: 'kamera' },
  { kana: 'キ', romaji: 'ki', type: 'katakana', group: 'カ행', exWord: 'キムチ', exMeaning: '김치', exRomaji: 'kimuchi' },
  { kana: 'ク', romaji: 'ku', type: 'katakana', group: 'カ행', exWord: 'クラス', exMeaning: '클래스', exRomaji: 'kurasu' },
  { kana: 'ケ', romaji: 'ke', type: 'katakana', group: 'カ행', exWord: 'ケーキ', exMeaning: '케이크', exRomaji: 'keeki' },
  { kana: 'コ', romaji: 'ko', type: 'katakana', group: 'カ행', exWord: 'コーヒー', exMeaning: '커피', exRomaji: 'koohii' },
  { kana: 'サ', romaji: 'sa', type: 'katakana', group: 'サ행', exWord: 'サラダ', exMeaning: '샐러드', exRomaji: 'sarada' },
  { kana: 'シ', romaji: 'shi', type: 'katakana', group: 'サ행', exWord: 'シャツ', exMeaning: '셔츠', exRomaji: 'shatsu' },
  { kana: 'ス', romaji: 'su', type: 'katakana', group: 'サ행', exWord: 'スマホ', exMeaning: '스마트폰', exRomaji: 'sumaho' },
  { kana: 'セ', romaji: 'se', type: 'katakana', group: 'サ행', exWord: 'セーター', exMeaning: '스웨터', exRomaji: 'seetaa' },
  { kana: 'ソ', romaji: 'so', type: 'katakana', group: 'サ행', exWord: 'ソファ', exMeaning: '소파', exRomaji: 'sofa' },
  { kana: 'タ', romaji: 'ta', type: 'katakana', group: 'タ행', exWord: 'タクシー', exMeaning: '택시', exRomaji: 'takushii' },
  { kana: 'チ', romaji: 'chi', type: 'katakana', group: 'タ행', exWord: 'チーズ', exMeaning: '치즈', exRomaji: 'chiizu' },
  { kana: 'ツ', romaji: 'tsu', type: 'katakana', group: 'タ행', exWord: 'ツアー', exMeaning: '투어', exRomaji: 'tsuaa' },
  { kana: 'テ', romaji: 'te', type: 'katakana', group: 'タ행', exWord: 'テレビ', exMeaning: '텔레비전', exRomaji: 'terebi' },
  { kana: 'ト', romaji: 'to', type: 'katakana', group: 'タ행', exWord: 'トイレ', exMeaning: '화장실', exRomaji: 'toire' },
  { kana: 'ナ', romaji: 'na', type: 'katakana', group: 'ナ행', exWord: 'ナイフ', exMeaning: '나이프', exRomaji: 'naifu' },
  { kana: 'ニ', romaji: 'ni', type: 'katakana', group: 'ナ행', exWord: 'ニュース', exMeaning: '뉴스', exRomaji: 'nyuusu' },
  { kana: 'ヌ', romaji: 'nu', type: 'katakana', group: 'ナ행', exWord: 'ヌードル', exMeaning: '면', exRomaji: 'nuudoru' },
  { kana: 'ネ', romaji: 'ne', type: 'katakana', group: 'ナ행', exWord: 'ネクタイ', exMeaning: '넥타이', exRomaji: 'nekutai' },
  { kana: 'ノ', romaji: 'no', type: 'katakana', group: 'ナ행', exWord: 'ノート', exMeaning: '노트', exRomaji: 'nooto' },
  { kana: 'ハ', romaji: 'ha', type: 'katakana', group: 'ハ행', exWord: 'ハンバーガー', exMeaning: '햄버거', exRomaji: 'hanbaagaa' },
  { kana: 'ヒ', romaji: 'hi', type: 'katakana', group: 'ハ행', exWord: 'ヒーター', exMeaning: '히터', exRomaji: 'hiitaa' },
  { kana: 'フ', romaji: 'fu', type: 'katakana', group: 'ハ행', exWord: 'フライ', exMeaning: '튀김', exRomaji: 'furai' },
  { kana: 'ヘ', romaji: 'he', type: 'katakana', group: 'ハ행', exWord: 'ヘルメット', exMeaning: '헬멧', exRomaji: 'herumetto' },
  { kana: 'ホ', romaji: 'ho', type: 'katakana', group: 'ハ행', exWord: 'ホテル', exMeaning: '호텔', exRomaji: 'hoteru' },
  { kana: 'マ', romaji: 'ma', type: 'katakana', group: 'マ행', exWord: 'マスク', exMeaning: '마스크', exRomaji: 'masuku' },
  { kana: 'ミ', romaji: 'mi', type: 'katakana', group: 'マ행', exWord: 'ミルク', exMeaning: '우유', exRomaji: 'miruku' },
  { kana: 'ム', romaji: 'mu', type: 'katakana', group: 'マ행', exWord: 'ムービー', exMeaning: '영화', exRomaji: 'muubii' },
  { kana: 'メ', romaji: 'me', type: 'katakana', group: 'マ행', exWord: 'メニュー', exMeaning: '메뉴', exRomaji: 'menyuu' },
  { kana: 'モ', romaji: 'mo', type: 'katakana', group: 'マ행', exWord: 'モニター', exMeaning: '모니터', exRomaji: 'monitaa' },
  { kana: 'ヤ', romaji: 'ya', type: 'katakana', group: 'ヤ행', exWord: 'ヤクルト', exMeaning: '야쿠르트', exRomaji: 'yakuruto' },
  { kana: 'ユ', romaji: 'yu', type: 'katakana', group: 'ヤ행', exWord: 'ユニフォーム', exMeaning: '유니폼', exRomaji: 'yunifoomu' },
  { kana: 'ヨ', romaji: 'yo', type: 'katakana', group: 'ヤ행', exWord: 'ヨーグルト', exMeaning: '요구르트', exRomaji: 'yooguruto' },
  { kana: 'ラ', romaji: 'ra', type: 'katakana', group: 'ラ행', exWord: 'ラーメン', exMeaning: '라멘', exRomaji: 'raamen' },
  { kana: 'リ', romaji: 'ri', type: 'katakana', group: 'ラ행', exWord: 'リモコン', exMeaning: '리모컨', exRomaji: 'rimokon' },
  { kana: 'ル', romaji: 'ru', type: 'katakana', group: 'ラ행', exWord: 'ルール', exMeaning: '규칙', exRomaji: 'ruuru' },
  { kana: 'レ', romaji: 're', type: 'katakana', group: 'ラ행', exWord: 'レストラン', exMeaning: '레스토랑', exRomaji: 'resutoran' },
  { kana: 'ロ', romaji: 'ro', type: 'katakana', group: 'ラ행', exWord: 'ロボット', exMeaning: '로봇', exRomaji: 'robotto' },
  { kana: 'ワ', romaji: 'wa', type: 'katakana', group: 'ワ행', exWord: 'ワイン', exMeaning: '와인', exRomaji: 'wain' },
  { kana: 'ヲ', romaji: 'wo', type: 'katakana', group: 'ワ행', exWord: 'ヲタク', exMeaning: '오타쿠', exRomaji: 'wotaku' },
  { kana: 'ン', romaji: 'n', type: 'katakana', group: 'ワ행', exWord: 'パン', exMeaning: '빵', exRomaji: 'pan' },
];

// N5 기초 단어
export const vocabulary = [
  { word: 'わたし', meaning: '나', romaji: 'watashi', level: 'N5', category: '대명사' },
  { word: 'あなた', meaning: '당신', romaji: 'anata', level: 'N5', category: '대명사' },
  { word: 'せんせい', meaning: '선생님', romaji: 'sensei', level: 'N5', category: '사람', kanji: '先生' },
  { word: 'がくせい', meaning: '학생', romaji: 'gakusei', level: 'N5', category: '사람', kanji: '学生' },
  { word: 'ともだち', meaning: '친구', romaji: 'tomodachi', level: 'N5', category: '사람', kanji: '友達' },
  { word: 'にほんご', meaning: '일본어', romaji: 'nihongo', level: 'N5', category: '언어', kanji: '日本語' },
  { word: 'かんこくご', meaning: '한국어', romaji: 'kankokugo', level: 'N5', category: '언어', kanji: '韓国語' },
  { word: 'みず', meaning: '물', romaji: 'mizu', level: 'N5', category: '음식', kanji: '水' },
  { word: 'たべもの', meaning: '음식', romaji: 'tabemono', level: 'N5', category: '음식', kanji: '食べ物' },
  { word: 'のみもの', meaning: '음료', romaji: 'nomimono', level: 'N5', category: '음식', kanji: '飲み物' },
  { word: 'ねこ', meaning: '고양이', romaji: 'neko', level: 'N5', category: '동물', kanji: '猫' },
  { word: 'いぬ', meaning: '강아지', romaji: 'inu', level: 'N5', category: '동물', kanji: '犬' },
  { word: 'ほん', meaning: '책', romaji: 'hon', level: 'N5', category: '물건', kanji: '本' },
  { word: 'でんわ', meaning: '전화', romaji: 'denwa', level: 'N5', category: '물건', kanji: '電話' },
  { word: 'くるま', meaning: '자동차', romaji: 'kuruma', level: 'N5', category: '물건', kanji: '車' },
  { word: 'いえ', meaning: '집', romaji: 'ie', level: 'N5', category: '장소', kanji: '家' },
  { word: 'がっこう', meaning: '학교', romaji: 'gakkou', level: 'N5', category: '장소', kanji: '学校' },
  { word: 'えき', meaning: '역', romaji: 'eki', level: 'N5', category: '장소', kanji: '駅' },
  { word: 'たべる', meaning: '먹다', romaji: 'taberu', level: 'N5', category: '동사', kanji: '食べる' },
  { word: 'のむ', meaning: '마시다', romaji: 'nomu', level: 'N5', category: '동사', kanji: '飲む' },
  { word: 'みる', meaning: '보다', romaji: 'miru', level: 'N5', category: '동사', kanji: '見る' },
  { word: 'きく', meaning: '듣다', romaji: 'kiku', level: 'N5', category: '동사', kanji: '聞く' },
  { word: 'いく', meaning: '가다', romaji: 'iku', level: 'N5', category: '동사', kanji: '行く' },
  { word: 'くる', meaning: '오다', romaji: 'kuru', level: 'N5', category: '동사', kanji: '来る' },
  { word: 'おおきい', meaning: '크다', romaji: 'ookii', level: 'N5', category: '형용사', kanji: '大きい' },
  { word: 'ちいさい', meaning: '작다', romaji: 'chiisai', level: 'N5', category: '형용사', kanji: '小さい' },
  { word: 'あたらしい', meaning: '새롭다', romaji: 'atarashii', level: 'N5', category: '형용사', kanji: '新しい' },
  { word: 'ふるい', meaning: '오래되다', romaji: 'furui', level: 'N5', category: '형용사', kanji: '古い' },
  { word: 'いち', meaning: '1', romaji: 'ichi', level: 'N5', category: '숫자', kanji: '一' },
  { word: 'に', meaning: '2', romaji: 'ni', level: 'N5', category: '숫자', kanji: '二' },
  { word: 'さん', meaning: '3', romaji: 'san', level: 'N5', category: '숫자', kanji: '三' },
];

// 기초 문장 (문장 조립용)
export const sentences = [
  { japanese: 'わたし は がくせい です', meaning: '저는 학생입니다', words: ['わたし', 'は', 'がくせい', 'です'], level: 'N5' },
  { japanese: 'これ は ほん です', meaning: '이것은 책입니다', words: ['これ', 'は', 'ほん', 'です'], level: 'N5' },
  { japanese: 'ねこ が すき です', meaning: '고양이를 좋아합니다', words: ['ねこ', 'が', 'すき', 'です'], level: 'N5' },
  { japanese: 'にほんご を べんきょう します', meaning: '일본어를 공부합니다', words: ['にほんご', 'を', 'べんきょう', 'します'], level: 'N5' },
  { japanese: 'まいにち がっこう に いきます', meaning: '매일 학교에 갑니다', words: ['まいにち', 'がっこう', 'に', 'いきます'], level: 'N5' },
  { japanese: 'みず を のみます', meaning: '물을 마십니다', words: ['みず', 'を', 'のみます'], level: 'N5' },
  { japanese: 'ともだち と はなします', meaning: '친구와 이야기합니다', words: ['ともだち', 'と', 'はなします'], level: 'N5' },
  { japanese: 'あした がっこう に いきます', meaning: '내일 학교에 갑니다', words: ['あした', 'がっこう', 'に', 'いきます'], level: 'N5' },
];

// 레슨 구성
export const lessonUnits = [
  {
    id: 1, title: '히라가나 모음', description: 'あいうえお를 배워봐요',
    type: 'hiragana', items: hiragana.filter(h => h.group === '모음'), icon: 'あ', color: '#58cc02',
  },
  {
    id: 2, title: 'か행', description: 'かきくけこ를 배워봐요',
    type: 'hiragana', items: hiragana.filter(h => h.group === 'か행'), icon: 'か', color: '#58cc02',
  },
  {
    id: 3, title: 'さ행', description: 'さしすせそ를 배워봐요',
    type: 'hiragana', items: hiragana.filter(h => h.group === 'さ행'), icon: 'さ', color: '#58cc02',
  },
  {
    id: 4, title: 'た행', description: 'たちつてと를 배워봐요',
    type: 'hiragana', items: hiragana.filter(h => h.group === 'た행'), icon: 'た', color: '#58cc02',
  },
  {
    id: 5, title: 'な행', description: 'なにぬねの를 배워봐요',
    type: 'hiragana', items: hiragana.filter(h => h.group === 'な행'), icon: 'な', color: '#ce82ff',
  },
  {
    id: 6, title: 'は행', description: 'はひふへほ를 배워봐요',
    type: 'hiragana', items: hiragana.filter(h => h.group === 'は행'), icon: 'は', color: '#ce82ff',
  },
  {
    id: 7, title: 'ま행', description: 'まみむめも를 배워봐요',
    type: 'hiragana', items: hiragana.filter(h => h.group === 'ま행'), icon: 'ま', color: '#ce82ff',
  },
  {
    id: 8, title: 'や·ら·わ행', description: '나머지 히라가나를 배워봐요',
    type: 'hiragana', items: hiragana.filter(h => ['や행', 'ら행', 'わ행'].includes(h.group)), icon: 'や', color: '#ce82ff',
  },
  {
    id: 9, title: '가타카나 기초', description: '가타카나 모음을 배워봐요',
    type: 'katakana', items: katakana.filter(k => k.group === '모음'), icon: 'ア', color: '#00cd9c',
  },
  {
    id: 10, title: '기초 단어', description: 'N5 기초 단어를 배워봐요',
    type: 'vocabulary', items: vocabulary.slice(0, 10), icon: '言', color: '#1cb0f6',
  },
  {
    id: 11, title: '문장 만들기', description: '간단한 문장을 조립해봐요',
    type: 'sentence', items: sentences.slice(0, 4), icon: '文', color: '#ff9600',
  },
];
