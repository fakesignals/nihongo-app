import React, { useState, useEffect, useRef, useCallback } from 'react';
import { hiragana, katakana } from '../data/lessons';
import { useSound } from '../hooks/useSound';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SpeedQuiz({ onClose }) {
  const [tab, setTab] = useState('hiragana');
  const [gameState, setGameState] = useState('ready'); // ready | playing | result
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [bestScore, setBestScore] = useState(() => {
    try { return JSON.parse(localStorage.getItem('speed-quiz-best') || '0'); } catch { return 0; }
  });
  const { playCorrect, playWrong } = useSound();
  const timerRef = useRef(null);
  const baseTime = 3.5; // seconds

  const data = tab === 'hiragana' ? hiragana : katakana;

  const nextQuestion = useCallback(() => {
    const pool = shuffleArray(data);
    const item = pool[0];
    const wrongs = pool.filter(x => x.kana !== item.kana).slice(0, 3);
    const opts = shuffleArray([item.romaji, ...wrongs.map(w => w.romaji)]);
    setCurrent(item);
    setOptions(opts);
    setFeedback(null);
    // 더 맞출수록 시간 줄어듦 (최소 1.5초)
    const newTime = Math.max(1.5, baseTime - (score * 0.05));
    setTimeLeft(newTime);
  }, [data, score]);

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalAnswered(0);
    setGameState('playing');
    nextQuestion();
  };

  // 타이머
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) {
          // 시간 초과 = 틀림
          handleTimeout();
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [gameState, current]);

  const handleTimeout = () => {
    playWrong();
    setFeedback('wrong');
    setCombo(0);
    setTotalAnswered(t => t + 1);
    clearInterval(timerRef.current);
    setTimeout(() => {
      endGame();
    }, 800);
  };

  const endGame = () => {
    setGameState('result');
    clearInterval(timerRef.current);
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('speed-quiz-best', JSON.stringify(score));
    }
  };

  const handleAnswer = (option) => {
    if (feedback) return;
    clearInterval(timerRef.current);

    if (option === current.romaji) {
      playCorrect();
      setFeedback('correct');
      const newCombo = combo + 1;
      const comboBonus = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;
      setScore(s => s + comboBonus);
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      setTotalAnswered(t => t + 1);
      setTimeout(() => nextQuestion(), 400);
    } else {
      playWrong();
      setFeedback('wrong');
      setCombo(0);
      setTotalAnswered(t => t + 1);
      setTimeout(() => endGame(), 800);
    }
  };

  // 준비 화면
  if (gameState === 'ready') {
    return (
      <div className="speed-quiz">
        <div className="speed-header">
          <button className="btn-quit" onClick={onClose}>&times;</button>
          <h2>스피드 퀴즈</h2>
          <span />
        </div>
        <div className="speed-ready">
          <div className="speed-icon-big">&#9889;</div>
          <h3>얼마나 빨리 맞출 수 있을까?</h3>
          <p>글자를 보고 발음을 고르세요!<br/>틀리거나 시간이 초과되면 끝!</p>
          <div className="card-tabs" style={{marginBottom: 16}}>
            <button className={`card-tab ${tab === 'hiragana' ? 'active' : ''}`} onClick={() => setTab('hiragana')}>히라가나</button>
            <button className={`card-tab ${tab === 'katakana' ? 'active' : ''}`} onClick={() => setTab('katakana')}>가타카나</button>
          </div>
          {bestScore > 0 && <p className="speed-best">최고 기록: {bestScore}점</p>}
          <button className="btn-primary" onClick={startGame}>시작!</button>
        </div>
      </div>
    );
  }

  // 결과 화면
  if (gameState === 'result') {
    const isNewBest = score >= bestScore && score > 0;
    return (
      <div className="speed-quiz">
        <div className="speed-header">
          <button className="btn-quit" onClick={onClose}>&times;</button>
          <h2>결과</h2>
          <span />
        </div>
        <div className="speed-result">
          {isNewBest && <div className="new-best">NEW BEST!</div>}
          <div className="speed-score-big">{score}</div>
          <p className="speed-score-label">점</p>
          <div className="speed-stats">
            <div className="speed-stat-item">
              <span className="speed-stat-value">{totalAnswered}</span>
              <span className="speed-stat-label">문제</span>
            </div>
            <div className="speed-stat-item">
              <span className="speed-stat-value">{maxCombo}</span>
              <span className="speed-stat-label">최대 콤보</span>
            </div>
            <div className="speed-stat-item">
              <span className="speed-stat-value">{bestScore}</span>
              <span className="speed-stat-label">최고 기록</span>
            </div>
          </div>
          <div style={{display:'flex', gap: 10, width:'100%'}}>
            <button className="btn-primary" style={{flex:1}} onClick={startGame}>다시!</button>
            <button className="card-nav-btn" style={{flex:1}} onClick={onClose}>나가기</button>
          </div>
        </div>
      </div>
    );
  }

  // 플레이 화면
  const timerPct = (timeLeft / baseTime) * 100;
  return (
    <div className="speed-quiz">
      <div className="speed-header">
        <div className="speed-score">&#9733; {score}</div>
        <div className="speed-timer-bar">
          <div
            className={`speed-timer-fill ${timerPct < 30 ? 'danger' : ''}`}
            style={{ width: `${Math.max(0, timerPct)}%` }}
          />
        </div>
        {combo >= 3 && <div className="speed-combo">x{combo}</div>}
      </div>

      <div className="speed-play">
        <div className={`speed-kana ${feedback || ''}`}>
          {current?.kana}
        </div>

        <div className="speed-options">
          {options.map((opt, i) => (
            <button
              key={i}
              className={`speed-opt ${feedback && opt === current?.romaji ? 'correct' : ''} ${feedback === 'wrong' && opt !== current?.romaji ? '' : ''}`}
              onClick={() => handleAnswer(opt)}
              disabled={!!feedback}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
