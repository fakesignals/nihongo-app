import React, { useState, useEffect, useMemo } from 'react';
import { useSound } from '../hooks/useSound';

function buildSteps(items) {
  const steps = [];
  const learned = [];
  const shuffled = [...items].sort(() => Math.random() - 0.5);

  shuffled.forEach((item, idx) => {
    // 1) 새 글자 소개 (예시 단어 포함)
    steps.push({ type: 'intro', item });

    // 2) 방금 배운 글자 - "이 발음의 글자는?"
    const wrongPool = shuffled.filter((_, i) => i !== idx);
    const wrongs = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [item, ...wrongs].sort(() => Math.random() - 0.5);
    steps.push({
      type: 'pickKana',
      prompt: item.romaji,
      promptLabel: item.meaning
        ? `"${item.meaning}"는 어떤 글자?`
        : `"${item.romaji}"는 어떤 글자?`,
      correct: item,
      options,
      item,
    });

    // 3) 글자 보고 발음 고르기
    const wrongRomaji = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3);
    const romajiOptions = [
      item.meaning || item.romaji,
      ...wrongRomaji.map(w => w.meaning || w.romaji),
    ].sort(() => Math.random() - 0.5);
    steps.push({
      type: 'pickRomaji',
      prompt: item.kana || item.word,
      promptLabel: '이 글자의 뜻은?',
      correct: item.meaning || item.romaji,
      options: romajiOptions,
      item,
    });

    // 4) 예시 단어 듣기 퀴즈 (히라가나/가타카나만)
    if (item.exWord) {
      const exWrongs = wrongPool
        .filter(w => w.exMeaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const exOptions = [
        item.exMeaning,
        ...exWrongs.map(w => w.exMeaning),
      ].sort(() => Math.random() - 0.5);
      steps.push({
        type: 'listenWord',
        prompt: item.exWord,
        promptLabel: `"${item.exWord}"의 뜻은?`,
        correct: item.exMeaning,
        options: exOptions,
        item,
      });
    }

    // 5) 이전 것 복습
    if (learned.length >= 2) {
      const reviewItem = learned[Math.floor(Math.random() * learned.length)];
      const reviewWrongs = shuffled
        .filter(x => (x.kana || x.word) !== (reviewItem.kana || reviewItem.word))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const reviewOptions = [reviewItem, ...reviewWrongs].sort(() => Math.random() - 0.5);
      steps.push({
        type: 'pickKana',
        prompt: reviewItem.romaji,
        promptLabel: `복습! "${reviewItem.meaning || reviewItem.romaji}"는?`,
        correct: reviewItem,
        options: reviewOptions,
        item: reviewItem,
      });
    }

    learned.push(item);
  });

  return steps;
}

export default function LearnPhase({ unit, onComplete, onQuit }) {
  const steps = useMemo(() => buildSteps(unit.items), [unit]);
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [streak, setStreak] = useState(0);
  const { speakJapanese, playCorrect, playWrong } = useSound();

  const current = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  // 소개 단계에서 예시 단어 자동 발음
  useEffect(() => {
    if (current?.type === 'intro') {
      const timer = setTimeout(() => {
        const item = current.item;
        // 예시 단어를 읽어줌 (더 길어서 잘 들림)
        speakJapanese(item.exWord || item.kana || item.word);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stepIndex]);

  const handleNext = () => {
    if (stepIndex + 1 >= steps.length) {
      onComplete();
    } else {
      setStepIndex(i => i + 1);
      setSelected(null);
      setAnswered(false);
      setIsCorrect(null);
    }
  };

  const handleSelect = (option) => {
    if (answered) return;
    setSelected(option);

    let correct;
    if (current.type === 'pickKana') {
      correct = (option.kana || option.word) === (current.correct.kana || current.correct.word);
    } else {
      correct = option === current.correct;
    }

    setAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      playCorrect();
      setStreak(s => s + 1);
      speakJapanese(current.item.exWord || current.item.kana || current.item.word);
    } else {
      playWrong();
      setStreak(0);
    }
  };

  // ===== 소개 화면 =====
  if (current.type === 'intro') {
    const item = current.item;
    return (
      <div className="learn-phase">
        <div className="learn-header">
          <button className="btn-quit" onClick={onQuit}>&times;</button>
          <div className="progress-bar">
            <div className="progress-fill learn-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="intro-screen">
          <p className="intro-label">새로운 글자</p>

          <div
            className="intro-card"
            onClick={() => speakJapanese(item.exWord || item.kana || item.word)}
          >
            <span className="intro-kana">{item.kana || item.word}</span>
          </div>

          <div className="intro-details">
            <div className="intro-romaji">{item.romaji}</div>
            {item.meaning && <div className="intro-meaning">{item.meaning}</div>}
          </div>

          {/* 예시 단어 카드 */}
          {item.exWord && (
            <div
              className="example-word-card"
              onClick={() => speakJapanese(item.exWord)}
            >
              <div className="example-word-top">
                <span className="example-word-text">{item.exWord}</span>
                <span className="example-word-speaker">&#128266;</span>
              </div>
              <div className="example-word-bottom">
                <span className="example-word-romaji">{item.exRomaji}</span>
                <span className="example-word-meaning">{item.exMeaning}</span>
              </div>
              <div className="example-word-highlight">
                <span className="highlight-kana">{item.kana}</span> = {item.romaji}
              </div>
            </div>
          )}

          <button className="btn-learn-next" onClick={handleNext}>
            알겠어요!
          </button>
        </div>
      </div>
    );
  }

  // ===== 듣기 퀴즈 (예시 단어) =====
  if (current.type === 'listenWord') {
    return (
      <div className="learn-phase">
        <div className="learn-header">
          <button className="btn-quit" onClick={onQuit}>&times;</button>
          <div className="progress-bar">
            <div className="progress-fill learn-fill" style={{ width: `${progress}%` }} />
          </div>
          {streak >= 2 && <span className="mini-streak">&#128293; {streak}</span>}
        </div>

        <div className="mini-quiz">
          <p className="mini-prompt">{current.promptLabel}</p>

          <button
            className="listen-btn"
            onClick={() => speakJapanese(current.prompt)}
          >
            <span className="listen-icon">&#128266;</span>
            <span>다시 듣기</span>
          </button>

          <p className="listen-word-display">{current.prompt}</p>

          <div className="mini-options">
            {current.options.map((option, i) => {
              let cls = 'mini-option';
              if (answered && option === current.correct) cls += ' correct';
              if (answered && selected === option && option !== current.correct) cls += ' wrong';
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => handleSelect(option)}
                  disabled={answered}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`mini-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
              {isCorrect ? (
                <p>&#10003; 정답!</p>
              ) : (
                <p>&#10007; 정답: {current.correct}</p>
              )}
              <button className="btn-learn-continue" onClick={handleNext}>계속</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== pickKana / pickRomaji 퀴즈 =====
  return (
    <div className="learn-phase">
      <div className="learn-header">
        <button className="btn-quit" onClick={onQuit}>&times;</button>
        <div className="progress-bar">
          <div className="progress-fill learn-fill" style={{ width: `${progress}%` }} />
        </div>
        {streak >= 2 && <span className="mini-streak">&#128293; {streak}</span>}
      </div>

      <div className="mini-quiz">
        <p className="mini-prompt">{current.promptLabel}</p>

        {current.type === 'pickRomaji' && (
          <div
            className="mini-display"
            onClick={() => speakJapanese(current.item.exWord || current.prompt)}
          >
            <span className="mini-kana">{current.prompt}</span>
          </div>
        )}

        <div className={`mini-options ${current.type === 'pickKana' ? 'kana-grid' : ''}`}>
          {current.options.map((option, i) => {
            const isKana = current.type === 'pickKana';
            const optionKey = isKana ? (option.kana || option.word) : option;
            const correctKey = isKana
              ? (current.correct.kana || current.correct.word)
              : current.correct;
            const selectedKey = selected
              ? isKana ? (selected.kana || selected.word) : selected
              : null;

            let cls = 'mini-option';
            if (answered && optionKey === correctKey) cls += ' correct';
            if (answered && selectedKey === optionKey && optionKey !== correctKey) cls += ' wrong';

            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleSelect(option)}
                disabled={answered}
              >
                {isKana ? (
                  <span className="option-kana">{option.kana || option.word}</span>
                ) : (
                  <span>{option}</span>
                )}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className={`mini-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? (
              <p>&#10003; 정답!</p>
            ) : (
              <p>
                &#10007; 정답: {current.type === 'pickKana'
                  ? `${current.correct.kana || current.correct.word} (${current.correct.romaji})`
                  : current.correct}
              </p>
            )}
            <button className="btn-learn-continue" onClick={handleNext}>계속</button>
          </div>
        )}
      </div>
    </div>
  );
}
