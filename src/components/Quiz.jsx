import React, { useState, useMemo } from 'react';
import MultipleChoice from './questions/MultipleChoice';
import TypeAnswer from './questions/TypeAnswer';
import SentenceBuilder from './questions/SentenceBuilder';
import ListenAndChoose from './questions/ListenAndChoose';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(unit) {
  const questions = [];
  const items = unit.items;

  if (unit.type === 'sentence') {
    items.forEach(item => {
      questions.push({ type: 'sentence', data: item });
    });
    return shuffleArray(questions);
  }

  items.forEach(item => {
    const wrongOptions = shuffleArray(
      items.filter(o => (o.kana || o.word) !== (item.kana || item.word))
    ).slice(0, 3);

    // 4지선다만 (학습 단계에서 이미 배웠으니 선택형 위주)
    questions.push({
      type: 'multipleChoice',
      data: {
        question: item.kana || item.word,
        correct: unit.type === 'vocabulary' ? item.meaning : item.romaji,
        options: shuffleArray([
          unit.type === 'vocabulary' ? item.meaning : item.romaji,
          ...wrongOptions.map(o => unit.type === 'vocabulary' ? o.meaning : o.romaji),
        ]),
        item,
      },
    });

    // 듣기 문제
    questions.push({
      type: 'listenAndChoose',
      data: {
        text: item.kana || item.word,
        correct: unit.type === 'vocabulary' ? item.meaning : item.romaji,
        options: shuffleArray([
          unit.type === 'vocabulary' ? item.meaning : item.romaji,
          ...wrongOptions.map(o => unit.type === 'vocabulary' ? o.meaning : o.romaji),
        ]),
        item,
      },
    });
  });

  // 셔플하고 7문제로 제한 (부담 줄이기)
  return shuffleArray(questions).slice(0, 7);
}

export default function Quiz({ unit, hearts, onCorrect, onWrong, onComplete, onQuit }) {
  const questions = useMemo(() => generateQuestions(unit), [unit]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const progress = ((currentIndex) / questions.length) * 100;
  const current = questions[currentIndex];

  const handleAnswer = (correct) => {
    setAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
      onCorrect(current.data.item || current.data);
    } else {
      onWrong(current.data.item || current.data);
    }
  };

  const handleNext = () => {
    // 하트 0이어도 끝까지 풀 수 있게 (점수만 깎임)
    if (currentIndex + 1 >= questions.length) {
      setShowResult(true);
    } else {
      setCurrentIndex(i => i + 1);
      setAnswered(false);
      setIsCorrect(null);
    }
  };

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const xpEarned = score * 10;
    const passed = percentage >= 50;
    return (
      <div className="quiz-result">
        <div className="result-card">
          <div className="result-emoji">{passed ? '🎉' : '😢'}</div>
          <h2>{passed ? '레슨 완료!' : '다시 도전해봐요!'}</h2>
          <div className="result-score">
            <div className={`score-circle ${passed ? '' : 'failed'}`}>
              <span>{percentage}%</span>
            </div>
          </div>
          <p>{score}/{questions.length} 정답</p>
          {passed && <p className="xp-earned">+{xpEarned} XP</p>}
          {!passed && <p className="fail-msg">50% 이상 맞으면 통과!</p>}
          <button className="btn-primary" onClick={() => onComplete(score, questions.length)}>
            {passed ? '다음 레슨으로!' : '돌아가기'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz">
      <div className="quiz-header">
        <button className="btn-quit" onClick={onQuit}>&times;</button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="quiz-count">{currentIndex + 1}/{questions.length}</span>
      </div>

      <div className="quiz-content">
        {current.type === 'multipleChoice' && (
          <MultipleChoice
            data={current.data}
            onAnswer={handleAnswer}
            answered={answered}
            isCorrect={isCorrect}
          />
        )}
        {current.type === 'typeAnswer' && (
          <TypeAnswer
            data={current.data}
            onAnswer={handleAnswer}
            answered={answered}
            isCorrect={isCorrect}
          />
        )}
        {current.type === 'sentence' && (
          <SentenceBuilder
            data={current.data}
            onAnswer={handleAnswer}
            answered={answered}
            isCorrect={isCorrect}
          />
        )}
        {current.type === 'listenAndChoose' && (
          <ListenAndChoose
            data={current.data}
            onAnswer={handleAnswer}
            answered={answered}
            isCorrect={isCorrect}
          />
        )}
      </div>

      {answered && (
        <div className={`quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
          <p>{isCorrect ? '정답!' : '틀렸어요!'}</p>
          {!isCorrect && current.data.correct && (
            <p className="correct-answer">정답: {current.data.correct}</p>
          )}
          {!isCorrect && current.data.japanese && (
            <p className="correct-answer">정답: {current.data.japanese}</p>
          )}
          <button className="btn-next" onClick={handleNext}>
            다음
          </button>
        </div>
      )}
    </div>
  );
}
