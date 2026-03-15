import React, { useState } from 'react';
import { useSound } from '../../hooks/useSound';

export default function TypeAnswer({ data, onAnswer, answered, isCorrect }) {
  const [input, setInput] = useState('');
  const { speakJapanese } = useSound();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answered || !input.trim()) return;
    const correct = input.trim().toLowerCase() === data.correct.toLowerCase();
    onAnswer(correct);
  };

  return (
    <div className="question-card">
      <h3 className="question-prompt">{data.hint}</h3>
      <div className="question-display" onClick={() => speakJapanese(data.question)}>
        <span className="big-kana">{data.question}</span>
        <span className="speak-hint">&#128266; 클릭하면 발음</span>
      </div>
      <form onSubmit={handleSubmit} className="type-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="답을 입력하세요"
          disabled={answered}
          autoFocus
          className={`type-input ${answered ? (isCorrect ? 'correct' : 'wrong') : ''}`}
        />
        {!answered && (
          <button type="submit" className="btn-check" disabled={!input.trim()}>
            확인
          </button>
        )}
      </form>
    </div>
  );
}
