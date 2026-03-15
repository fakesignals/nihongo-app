import React, { useState, useMemo, useEffect } from 'react';
import { hiragana, katakana } from '../data/lessons';
import { useSound } from '../hooks/useSound';

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MatchingGame({ onClose }) {
  const { playCorrect, playWrong } = useSound();
  const [round, setRound] = useState(0);
  const [matched, setMatched] = useState([]);
  const [selected, setSelected] = useState(null);
  const [wrongPair, setWrongPair] = useState(null);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);

  // 5쌍씩 (히라가나-가타카나 매칭)
  const pairs = useMemo(() => {
    const allPairs = hiragana.map((h, i) => ({
      hiragana: h,
      katakana: katakana[i],
      romaji: h.romaji,
    }));
    const shuffled = shuffleArray(allPairs);
    const rounds = [];
    for (let i = 0; i < shuffled.length; i += 5) {
      rounds.push(shuffled.slice(i, i + 5));
    }
    return rounds;
  }, []);

  const currentPairs = pairs[round] || pairs[0];

  // 카드 생성: 왼쪽 히라가나, 오른쪽 가타카나 (각각 셔플)
  const leftCards = useMemo(() =>
    shuffleArray(currentPairs.map(p => ({ ...p.hiragana, pairId: p.romaji, side: 'left' }))),
    [round]
  );
  const rightCards = useMemo(() =>
    shuffleArray(currentPairs.map(p => ({ ...p.katakana, pairId: p.romaji, side: 'right' }))),
    [round]
  );

  const handleSelect = (card) => {
    if (matched.includes(card.pairId)) return;
    if (wrongPair) return;

    if (!selected) {
      setSelected(card);
      return;
    }

    // 같은 쪽 카드면 선택 변경
    if (selected.side === card.side) {
      setSelected(card);
      return;
    }

    setMoves(m => m + 1);

    // 매칭 확인
    if (selected.pairId === card.pairId) {
      playCorrect();
      const newMatched = [...matched, card.pairId];
      setMatched(newMatched);
      setSelected(null);

      if (newMatched.length === currentPairs.length) {
        setTimeout(() => {
          if (round + 1 < pairs.length) {
            setRound(r => r + 1);
            setMatched([]);
            setSelected(null);
          } else {
            setCompleted(true);
          }
        }, 600);
      }
    } else {
      playWrong();
      setWrongPair({ a: selected, b: card });
      setTimeout(() => {
        setWrongPair(null);
        setSelected(null);
      }, 800);
    }
  };

  const getCardClass = (card) => {
    let cls = 'match-card';
    if (matched.includes(card.pairId)) cls += ' matched';
    if (selected?.kana === card.kana && selected?.side === card.side) cls += ' selected';
    if (wrongPair && (
      (wrongPair.a.kana === card.kana && wrongPair.a.side === card.side) ||
      (wrongPair.b.kana === card.kana && wrongPair.b.side === card.side)
    )) cls += ' wrong';
    return cls;
  };

  if (completed) {
    return (
      <div className="matching-game">
        <div className="speed-header">
          <button className="btn-quit" onClick={onClose}>&times;</button>
          <h2>매칭 게임</h2>
          <span />
        </div>
        <div className="speed-result">
          <div className="speed-icon-big">&#127942;</div>
          <h3>완료!</h3>
          <p>{moves}번 만에 모두 매칭했어요</p>
          <button className="btn-primary" onClick={() => { setRound(0); setMatched([]); setMoves(0); setCompleted(false); }}>
            다시 하기
          </button>
          <button className="card-nav-btn" style={{marginTop:10, width:'100%'}} onClick={onClose}>나가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="matching-game">
      <div className="speed-header">
        <button className="btn-quit" onClick={onClose}>&times;</button>
        <h2>히라가나 ↔ 가타카나</h2>
        <span className="card-page-info">{matched.length}/{currentPairs.length}</span>
      </div>

      <p className="match-instruction">같은 발음의 히라가나와 가타카나를 연결하세요</p>
      <p className="match-round">라운드 {round + 1}/{pairs.length} &middot; {moves}번 시도</p>

      <div className="match-columns">
        <div className="match-column">
          <span className="match-col-label">히라가나</span>
          {leftCards.map((card) => (
            <button
              key={card.kana}
              className={getCardClass(card)}
              onClick={() => handleSelect(card)}
              disabled={matched.includes(card.pairId)}
            >
              <span className="match-kana">{card.kana}</span>
            </button>
          ))}
        </div>
        <div className="match-column">
          <span className="match-col-label">가타카나</span>
          {rightCards.map((card) => (
            <button
              key={card.kana}
              className={getCardClass(card)}
              onClick={() => handleSelect(card)}
              disabled={matched.includes(card.pairId)}
            >
              <span className="match-kana">{card.kana}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
