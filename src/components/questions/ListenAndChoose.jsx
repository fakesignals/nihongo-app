import React, { useState, useEffect } from 'react';
import { useSound } from '../../hooks/useSound';

export default function ListenAndChoose({ data, onAnswer, answered, isCorrect }) {
  const [selected, setSelected] = useState(null);
  const { speakJapanese } = useSound();

  useEffect(() => {
    speakJapanese(data.text);
  }, []);

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
      <h3 className="question-prompt">무엇이라고 들리나요?</h3>
      <button className="listen-btn" onClick={() => speakJapanese(data.text)}>
        <span className="listen-icon">&#128266;</span>
        <span>다시 듣기</span>
      </button>
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
        <button className="btn-check" onClick={handleCheck} disabled={!selected}>
          확인
        </button>
      )}
    </div>
  );
}
