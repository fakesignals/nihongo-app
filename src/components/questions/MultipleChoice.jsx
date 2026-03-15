import React, { useState } from 'react';
import { useSound } from '../../hooks/useSound';

export default function MultipleChoice({ data, onAnswer, answered, isCorrect }) {
  const [selected, setSelected] = useState(null);
  const { speakJapanese } = useSound();

  const handleSelect = (option) => {
    if (answered) return;
    setSelected(option);
  };

  const handleCheck = () => {
    if (!selected || answered) return;
    onAnswer(selected === data.correct);
  };

  return (
    <div className="question-card">
      <h3 className="question-prompt">이 글자의 뜻은?</h3>
      <div className="question-display" onClick={() => speakJapanese(data.question)}>
        <span className="big-kana">{data.question}</span>
        <span className="speak-hint">&#128266; 클릭하면 발음</span>
      </div>
      <div className="options-grid">
        {data.options.map((option, i) => (
          <button
            key={i}
            className={`option-btn ${selected === option ? 'selected' : ''} ${
              answered && option === data.correct ? 'correct' : ''
            } ${answered && selected === option && option !== data.correct ? 'wrong' : ''}`}
            onClick={() => handleSelect(option)}
            disabled={answered}
          >
            {option}
          </button>
        ))}
      </div>
      {!answered && (
        <button
          className="btn-check"
          onClick={handleCheck}
          disabled={!selected}
        >
          확인
        </button>
      )}
    </div>
  );
}
