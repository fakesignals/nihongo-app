import React, { useState } from 'react';

export default function SentenceBuilder({ data, onAnswer, answered, isCorrect }) {
  const [selected, setSelected] = useState([]);
  const [available, setAvailable] = useState(
    [...data.words].sort(() => Math.random() - 0.5)
  );

  const handleWordClick = (word, index) => {
    if (answered) return;
    setSelected([...selected, word]);
    setAvailable(available.filter((_, i) => i !== index));
  };

  const handleRemoveWord = (word, index) => {
    if (answered) return;
    setAvailable([...available, word]);
    setSelected(selected.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    if (answered) return;
    const userAnswer = selected.join(' ');
    const correct = data.words.join(' ');
    onAnswer(userAnswer === correct);
  };

  return (
    <div className="question-card">
      <h3 className="question-prompt">문장을 조립하세요</h3>
      <p className="sentence-meaning">{data.meaning}</p>

      <div className="sentence-slots">
        {selected.length > 0 ? (
          selected.map((word, i) => (
            <button
              key={i}
              className="word-chip placed"
              onClick={() => handleRemoveWord(word, i)}
              disabled={answered}
            >
              {word}
            </button>
          ))
        ) : (
          <span className="placeholder-text">여기에 단어를 배치하세요</span>
        )}
      </div>

      <div className="word-bank">
        {available.map((word, i) => (
          <button
            key={i}
            className="word-chip"
            onClick={() => handleWordClick(word, i)}
            disabled={answered}
          >
            {word}
          </button>
        ))}
      </div>

      {!answered && selected.length === data.words.length && (
        <button className="btn-check" onClick={handleCheck}>
          확인
        </button>
      )}
    </div>
  );
}
