import React, { useState, useMemo } from 'react';
import { useSound } from '../hooks/useSound';

// 헷갈리는 글자 쌍
const CONFUSABLE_PAIRS = [
  // 히라가나
  { a: { kana: 'は', romaji: 'ha' }, b: { kana: 'ほ', romaji: 'ho' }, tip: 'は는 위가 열려있고, ほ는 네모가 닫혀있어요' },
  { a: { kana: 'ま', romaji: 'ma' }, b: { kana: 'も', romaji: 'mo' }, tip: 'ま는 동그라미가 있고, も는 없어요' },
  { a: { kana: 'ね', romaji: 'ne' }, b: { kana: 'れ', romaji: 're' }, tip: 'ね는 마지막이 동그랗고, れ는 쭉 내려가요' },
  { a: { kana: 'わ', romaji: 'wa' }, b: { kana: 'れ', romaji: 're' }, tip: 'わ는 간단하고, れ는 왼쪽에 세로획이 있어요' },
  { a: { kana: 'め', romaji: 'me' }, b: { kana: 'ぬ', romaji: 'nu' }, tip: 'め는 끝이 안 꼬이고, ぬ는 끝이 꼬여요' },
  { a: { kana: 'あ', romaji: 'a' }, b: { kana: 'お', romaji: 'o' }, tip: 'あ는 왼쪽이 열려있고, お는 점이 있어요' },
  { a: { kana: 'き', romaji: 'ki' }, b: { kana: 'さ', romaji: 'sa' }, tip: 'き는 가로획이 2개, さ는 1개' },
  { a: { kana: 'う', romaji: 'u' }, b: { kana: 'つ', romaji: 'tsu' }, tip: 'う는 위에 점, つ는 점이 없어요' },
  // 가타카나
  { a: { kana: 'シ', romaji: 'shi' }, b: { kana: 'ツ', romaji: 'tsu' }, tip: 'シ는 점이 세로로, ツ는 점이 가로로 배열' },
  { a: { kana: 'ソ', romaji: 'so' }, b: { kana: 'ン', romaji: 'n' }, tip: 'ソ는 점이 위에서 아래로, ン는 아래에서 위로' },
  { a: { kana: 'ウ', romaji: 'u' }, b: { kana: 'ワ', romaji: 'wa' }, tip: 'ウ는 위에 가로획, ワ는 없어요' },
  { a: { kana: 'ク', romaji: 'ku' }, b: { kana: 'タ', romaji: 'ta' }, tip: 'タ는 안에 가로획이 하나 더 있어요' },
  { a: { kana: 'ア', romaji: 'a' }, b: { kana: 'マ', romaji: 'ma' }, tip: 'ア는 마지막이 쭉, マ는 꺾여요' },
  { a: { kana: 'コ', romaji: 'ko' }, b: { kana: 'ユ', romaji: 'yu' }, tip: 'コ는 오른쪽이 닫혀있고, ユ는 열려있어요' },
  { a: { kana: 'ヌ', romaji: 'nu' }, b: { kana: 'ス', romaji: 'su' }, tip: 'ヌ는 X형태, ス는 아래가 꼬여요' },
];

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function ConfusableQuiz({ onClose }) {
  const pairs = useMemo(() => shuffleArray(CONFUSABLE_PAIRS), []);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('compare'); // compare | quiz | tip
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const { speakJapanese, playCorrect, playWrong } = useSound();

  const current = pairs[index % pairs.length];

  // 어떤 걸 맞추라고 할지 랜덤
  const [target] = useState(() => Math.random() > 0.5 ? 'a' : 'b');
  const [quizTarget, setQuizTarget] = useState(current[Math.random() > 0.5 ? 'a' : 'b']);

  const startQuiz = () => {
    const t = Math.random() > 0.5 ? 'a' : 'b';
    setQuizTarget(current[t]);
    setPhase('quiz');
    setSelected(null);
    setIsCorrect(null);
  };

  const handlePick = (picked) => {
    if (selected) return;
    setSelected(picked);
    const correct = picked.kana === quizTarget.kana;
    setIsCorrect(correct);
    setTotal(t => t + 1);
    if (correct) {
      playCorrect();
      setScore(s => s + 1);
    } else {
      playWrong();
    }
  };

  const nextPair = () => {
    setIndex(i => i + 1);
    setPhase('compare');
    setSelected(null);
    setIsCorrect(null);
  };

  const showDone = index >= pairs.length - 1 && phase === 'tip';

  if (showDone) {
    return (
      <div className="confuse-quiz">
        <div className="speed-header">
          <button className="btn-quit" onClick={onClose}>&times;</button>
          <h2>헷갈리는 글자</h2>
          <span />
        </div>
        <div className="speed-result">
          <div className="speed-score-big">{score}/{total}</div>
          <p>헷갈리는 글자를 구분할 수 있게 됐어요!</p>
          <button className="btn-primary" onClick={() => { setIndex(0); setScore(0); setTotal(0); setPhase('compare'); }}>
            다시 하기
          </button>
          <button className="card-nav-btn" style={{marginTop:10, width:'100%'}} onClick={onClose}>나가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="confuse-quiz">
      <div className="speed-header">
        <button className="btn-quit" onClick={onClose}>&times;</button>
        <h2>헷갈리는 글자</h2>
        <span className="card-page-info">{index + 1}/{pairs.length}</span>
      </div>

      {/* 비교 화면 */}
      {phase === 'compare' && (
        <div className="confuse-compare">
          <p className="confuse-label">이 둘의 차이를 기억하세요!</p>
          <div className="confuse-pair">
            <div className="confuse-card" onClick={() => speakJapanese(current.a.kana)}>
              <span className="confuse-kana">{current.a.kana}</span>
              <span className="confuse-romaji">{current.a.romaji}</span>
            </div>
            <span className="confuse-vs">VS</span>
            <div className="confuse-card" onClick={() => speakJapanese(current.b.kana)}>
              <span className="confuse-kana">{current.b.kana}</span>
              <span className="confuse-romaji">{current.b.romaji}</span>
            </div>
          </div>
          <div className="confuse-tip-box">
            <p>{current.tip}</p>
          </div>
          <button className="btn-primary" onClick={startQuiz}>구분해보기!</button>
        </div>
      )}

      {/* 퀴즈 */}
      {phase === 'quiz' && (
        <div className="confuse-compare">
          <p className="confuse-label">"{quizTarget.romaji}"는 어느 쪽?</p>
          <div className="confuse-pair">
            <div
              className={`confuse-card pickable ${selected?.kana === current.a.kana ? (isCorrect ? 'correct' : 'wrong') : ''} ${!selected && 'hoverable'}`}
              onClick={() => handlePick(current.a)}
            >
              <span className="confuse-kana">{current.a.kana}</span>
            </div>
            <span className="confuse-vs">?</span>
            <div
              className={`confuse-card pickable ${selected?.kana === current.b.kana ? (isCorrect ? 'correct' : 'wrong') : ''} ${!selected && 'hoverable'}`}
              onClick={() => handlePick(current.b)}
            >
              <span className="confuse-kana">{current.b.kana}</span>
            </div>
          </div>

          {selected && (
            <div className={`mini-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
              <p>{isCorrect ? '&#10003; 맞아요!' : `&#10007; 이건 "${selected.romaji}"예요`}</p>
              <button className="btn-learn-continue" onClick={() => setPhase('tip')}>계속</button>
            </div>
          )}
        </div>
      )}

      {/* 팁 */}
      {phase === 'tip' && (
        <div className="confuse-compare">
          <div className="confuse-pair">
            <div className="confuse-card" onClick={() => speakJapanese(current.a.kana)}>
              <span className="confuse-kana">{current.a.kana}</span>
              <span className="confuse-romaji">{current.a.romaji}</span>
            </div>
            <span className="confuse-vs">VS</span>
            <div className="confuse-card" onClick={() => speakJapanese(current.b.kana)}>
              <span className="confuse-kana">{current.b.kana}</span>
              <span className="confuse-romaji">{current.b.romaji}</span>
            </div>
          </div>
          <div className="confuse-tip-box highlight">
            <p>{current.tip}</p>
          </div>
          <button className="btn-primary" onClick={nextPair}>다음 쌍</button>
        </div>
      )}
    </div>
  );
}
