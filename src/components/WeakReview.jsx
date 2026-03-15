import React, { useState, useMemo } from 'react';
import { hiragana, katakana } from '../data/lessons';
import { useSound } from '../hooks/useSound';

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function WeakReview({ wrongAnswers, onClose }) {
  const { speakJapanese, playCorrect, playWrong } = useSound();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const allItems = [...hiragana, ...katakana];

  // 약점 아이템 목록
  const weakItems = useMemo(() => {
    if (wrongAnswers.length === 0) return [];
    const items = wrongAnswers.map(w => w.item).filter(Boolean);
    // 중복 제거
    const unique = [];
    const seen = new Set();
    items.forEach(item => {
      const key = item.kana || item.word;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });
    return shuffleArray(unique);
  }, [wrongAnswers]);

  if (weakItems.length === 0) {
    return (
      <div className="weak-review">
        <div className="speed-header">
          <button className="btn-quit" onClick={onClose}>&times;</button>
          <h2>약점 복습</h2>
          <span />
        </div>
        <div className="speed-result">
          <div className="speed-icon-big">&#127881;</div>
          <h3>틀린 문제가 없어요!</h3>
          <p>레슨을 풀면서 틀린 글자가 여기에 모여요</p>
          <button className="btn-primary" onClick={onClose}>돌아가기</button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="weak-review">
        <div className="speed-header">
          <button className="btn-quit" onClick={onClose}>&times;</button>
          <h2>약점 복습</h2>
          <span />
        </div>
        <div className="speed-result">
          <div className="speed-score-big">{score}/{weakItems.length}</div>
          <p>{score === weakItems.length ? '완벽해요! 약점을 극복했어요!' : '조금 더 연습하면 완벽해질 거예요!'}</p>
          <button className="btn-primary" onClick={() => { setIndex(0); setScore(0); setDone(false); setSelected(null); setIsCorrect(null); }}>
            다시 하기
          </button>
          <button className="card-nav-btn" style={{marginTop:10, width:'100%'}} onClick={onClose}>나가기</button>
        </div>
      </div>
    );
  }

  const current = weakItems[index];
  const progress = ((index + 1) / weakItems.length) * 100;

  // 오답 생성
  const wrongOptions = shuffleArray(
    allItems.filter(x => x.kana !== current.kana && x.romaji !== current.romaji)
  ).slice(0, 3);
  const options = useMemo(() =>
    shuffleArray([current.romaji, ...wrongOptions.map(w => w.romaji)]),
    [index]
  );

  const handleSelect = (option) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === current.romaji;
    setIsCorrect(correct);
    if (correct) {
      playCorrect();
      setScore(s => s + 1);
    } else {
      playWrong();
    }
  };

  const handleNext = () => {
    if (index + 1 >= weakItems.length) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setSelected(null);
      setIsCorrect(null);
    }
  };

  return (
    <div className="weak-review">
      <div className="speed-header">
        <button className="btn-quit" onClick={onClose}>&times;</button>
        <div className="progress-bar" style={{flex:1}}>
          <div className="progress-fill" style={{width: `${progress}%`, background: '#ff9600'}} />
        </div>
        <span className="card-page-info">{index + 1}/{weakItems.length}</span>
      </div>

      <div className="mini-quiz">
        <p className="mini-prompt">이 글자의 발음은?</p>
        <div
          className="mini-display"
          onClick={() => speakJapanese(current.exWord || current.kana || current.word)}
        >
          <span className="mini-kana">{current.kana || current.word}</span>
        </div>

        {current.exWord && (
          <p className="weak-hint" onClick={() => speakJapanese(current.exWord)}>
            힌트: {current.exWord} ({current.exMeaning}) &#128266;
          </p>
        )}

        <div className="mini-options kana-grid">
          {options.map((opt, i) => {
            let cls = 'mini-option';
            if (selected !== null && opt === current.romaji) cls += ' correct';
            if (selected === opt && opt !== current.romaji) cls += ' wrong';
            return (
              <button key={i} className={cls} onClick={() => handleSelect(opt)} disabled={selected !== null}>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className={`mini-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
            <p>{isCorrect ? '&#10003; 정답!' : `&#10007; 정답: ${current.romaji}`}</p>
            <button className="btn-learn-continue" onClick={handleNext}>계속</button>
          </div>
        )}
      </div>
    </div>
  );
}
