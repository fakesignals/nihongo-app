import React, { useState, useRef, useEffect } from 'react';
import { hiragana, katakana } from '../data/lessons';
import { useSound } from '../hooks/useSound';

const STROKE_DATA = {
  // 모음 획순 가이드 (간략 방향)
  'あ': ['→', '↓↗', '↓↙'],
  'い': ['↓', '↓'],
  'う': ['·', '⌒'],
  'え': ['→', '↓↗'],
  'お': ['→', '↓', '↓↗·'],
  'か': ['→↓', '↗', '↓↙'],
  'き': ['→', '→', '↓↗'],
  'く': ['↙↗'],
  'け': ['↓', '→↓', '↗'],
  'こ': ['→', '→↓'],
};

export default function WritingPractice({ onClose }) {
  const [tab, setTab] = useState('hiragana');
  const [index, setIndex] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [guideOpacity, setGuideOpacity] = useState(0.3);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const { speakJapanese } = useSound();

  const data = tab === 'hiragana' ? hiragana : katakana;
  const current = data[index];
  const canvasSize = 280;

  useEffect(() => {
    clearCanvas();
  }, [index, tab]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // 배경 격자
    ctx.strokeStyle = '#2a3a42';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    // 십자선
    ctx.beginPath();
    ctx.moveTo(canvasSize / 2, 0);
    ctx.lineTo(canvasSize / 2, canvasSize);
    ctx.moveTo(0, canvasSize / 2);
    ctx.lineTo(canvasSize, canvasSize / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return {
      x: (touch.clientX - rect.left) * (canvasSize / rect.width),
      y: (touch.clientY - rect.top) * (canvasSize / rect.height),
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPos.current = pos;
  };

  const stopDraw = () => {
    isDrawing.current = false;
  };

  const handlePrev = () => {
    if (index > 0) setIndex(i => i - 1);
  };

  const handleNext = () => {
    if (index < data.length - 1) setIndex(i => i + 1);
  };

  return (
    <div className="writing-practice">
      <div className="speed-header">
        <button className="btn-quit" onClick={onClose}>&times;</button>
        <h2>글자 쓰기 연습</h2>
        <span className="card-page-info">{index + 1}/{data.length}</span>
      </div>

      <div className="card-tabs" style={{ marginBottom: 16 }}>
        <button className={`card-tab ${tab === 'hiragana' ? 'active' : ''}`} onClick={() => { setTab('hiragana'); setIndex(0); }}>히라가나</button>
        <button className={`card-tab ${tab === 'katakana' ? 'active' : ''}`} onClick={() => { setTab('katakana'); setIndex(0); }}>가타카나</button>
      </div>

      {/* 현재 글자 정보 */}
      <div className="writing-info">
        <div className="writing-target" onClick={() => speakJapanese(current.exWord || current.kana)}>
          <span className="writing-kana">{current.kana}</span>
        </div>
        <div className="writing-meta">
          <span className="writing-romaji">{current.romaji}</span>
          {current.exWord && (
            <span className="writing-example" onClick={() => speakJapanese(current.exWord)}>
              {current.exWord} ({current.exMeaning}) &#128266;
            </span>
          )}
        </div>
      </div>

      {/* 캔버스 */}
      <div className="canvas-wrapper">
        {showGuide && (
          <div
            className="canvas-guide"
            style={{ opacity: guideOpacity, fontSize: `${canvasSize * 0.75}px`, width: canvasSize, height: canvasSize }}
          >
            {current.kana}
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="write-canvas"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>

      {/* 가이드 토글 */}
      <div className="writing-controls">
        <label className="guide-toggle">
          <input
            type="checkbox"
            checked={showGuide}
            onChange={(e) => setShowGuide(e.target.checked)}
          />
          <span>가이드 표시</span>
        </label>
        {showGuide && (
          <div className="opacity-control">
            <span>연하게</span>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={guideOpacity}
              onChange={(e) => setGuideOpacity(parseFloat(e.target.value))}
            />
            <span>진하게</span>
          </div>
        )}
      </div>

      {/* 버튼들 */}
      <div className="writing-buttons">
        <button className="card-nav-btn" onClick={clearCanvas}>지우기</button>
        <button className="card-nav-btn" onClick={() => speakJapanese(current.exWord || current.kana)}>
          &#128266; 발음
        </button>
      </div>

      <div className="card-nav" style={{ marginTop: 16 }}>
        <button className="card-nav-btn" onClick={handlePrev} disabled={index === 0}>
          &#9664; 이전
        </button>
        <span style={{ color: '#6a7a82', fontSize: 14 }}>{current.group}</span>
        <button className="card-nav-btn" onClick={handleNext} disabled={index >= data.length - 1}>
          다음 &#9654;
        </button>
      </div>
    </div>
  );
}
