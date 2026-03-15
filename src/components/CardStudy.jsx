import React, { useState } from 'react';
import { hiragana, katakana } from '../data/lessons';
import { useSound } from '../hooks/useSound';

const CARDS_PER_PAGE = 5;

export default function CardStudy({ onClose }) {
  const [tab, setTab] = useState('hiragana'); // 'hiragana' | 'katakana'
  const [page, setPage] = useState(0);
  const [flipped, setFlipped] = useState({}); // { index: true/false }
  const { speakJapanese } = useSound();

  const data = tab === 'hiragana' ? hiragana : katakana;
  const totalPages = Math.ceil(data.length / CARDS_PER_PAGE);
  const currentCards = data.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  const handleFlip = (globalIndex, item) => {
    const wasFlipped = flipped[globalIndex];
    setFlipped(prev => ({ ...prev, [globalIndex]: !wasFlipped }));
    // 뒤집을 때 예시 단어 발음
    if (!wasFlipped) {
      speakJapanese(item.exWord || item.kana);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setFlipped({});
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setPage(0);
    setFlipped({});
  };

  // 현재 그룹 표시
  const currentGroup = currentCards[0]?.group || '';

  return (
    <div className="card-study">
      <div className="card-study-header">
        <button className="btn-quit" onClick={onClose}>&times;</button>
        <h2>글자 카드</h2>
        <span className="card-page-info">{page + 1} / {totalPages}</span>
      </div>

      {/* 탭 */}
      <div className="card-tabs">
        <button
          className={`card-tab ${tab === 'hiragana' ? 'active' : ''}`}
          onClick={() => handleTabChange('hiragana')}
        >
          히라가나
        </button>
        <button
          className={`card-tab ${tab === 'katakana' ? 'active' : ''}`}
          onClick={() => handleTabChange('katakana')}
        >
          가타카나
        </button>
      </div>

      <p className="card-group-label">{currentGroup}</p>

      {/* 카드 5장 */}
      <div className="card-grid">
        {currentCards.map((item, i) => {
          const globalIndex = page * CARDS_PER_PAGE + i;
          const isFlipped = flipped[globalIndex];

          return (
            <div
              key={globalIndex}
              className={`flip-card ${isFlipped ? 'flipped' : ''}`}
              onClick={() => handleFlip(globalIndex, item)}
            >
              <div className="flip-card-inner">
                {/* 앞면 */}
                <div className="flip-card-front">
                  <span className="flip-kana">{item.kana}</span>
                  <span className="flip-hint">탭하여 뒤집기</span>
                </div>
                {/* 뒷면 */}
                <div className="flip-card-back">
                  <span className="flip-romaji-big">{item.romaji}</span>
                  <div className="flip-divider" />
                  <span className="flip-ex-word">{item.exWord}</span>
                  <span className="flip-ex-romaji">{item.exRomaji}</span>
                  <span className="flip-ex-meaning">{item.exMeaning}</span>
                  <button
                    className="flip-speak"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(item.exWord);
                    }}
                  >
                    &#128266; 다시 듣기
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 페이지 네비게이션 */}
      <div className="card-nav">
        <button
          className="card-nav-btn"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 0}
        >
          &#9664; 이전
        </button>

        {/* 페이지 점 표시 */}
        <div className="card-dots">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`card-dot ${i === page ? 'active' : ''}`}
              onClick={() => handlePageChange(i)}
            />
          ))}
        </div>

        <button
          className="card-nav-btn"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages - 1}
        >
          다음 &#9654;
        </button>
      </div>

      {/* 전체 미니 차트 */}
      <div className="card-mini-chart">
        <p className="mini-chart-title">전체 보기</p>
        <div className="mini-chart-grid">
          {data.map((item, i) => {
            const isCurrentPage = i >= page * CARDS_PER_PAGE && i < (page + 1) * CARDS_PER_PAGE;
            return (
              <button
                key={i}
                className={`mini-chart-cell ${isCurrentPage ? 'current' : ''}`}
                onClick={() => {
                  handlePageChange(Math.floor(i / CARDS_PER_PAGE));
                  speakJapanese(item.exWord || item.kana);
                }}
              >
                <span>{item.kana}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
