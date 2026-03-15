import React from 'react';
import { lessonUnits } from '../data/lessons';

export default function LessonMap({
  completedLessons, wrongCount,
  onSelectLesson, onOpenCards, onOpenSpeed, onOpenConfuse, onOpenMatching, onOpenWriting, onOpenWeak,
}) {
  return (
    <div className="lesson-map">
      {/* 학습 도구 모음 */}
      <div className="tools-section">
        <h3 className="tools-title">학습 도구</h3>
        <div className="tools-grid">
          <button className="tool-btn" onClick={onOpenCards}>
            <span className="tool-icon" style={{background:'#1cb0f6'}}>あ</span>
            <span className="tool-label">카드 외우기</span>
          </button>
          <button className="tool-btn" onClick={onOpenWriting}>
            <span className="tool-icon" style={{background:'#ce82ff'}}>&#9998;</span>
            <span className="tool-label">쓰기 연습</span>
          </button>
          <button className="tool-btn" onClick={onOpenSpeed}>
            <span className="tool-icon" style={{background:'#ff9600'}}>&#9889;</span>
            <span className="tool-label">스피드 퀴즈</span>
          </button>
          <button className="tool-btn" onClick={onOpenConfuse}>
            <span className="tool-icon" style={{background:'#ff4b4b'}}>&#8800;</span>
            <span className="tool-label">헷갈리는 글자</span>
          </button>
          <button className="tool-btn" onClick={onOpenMatching}>
            <span className="tool-icon" style={{background:'#00cd9c'}}>&#8644;</span>
            <span className="tool-label">짝 맞추기</span>
          </button>
          <button className="tool-btn" onClick={onOpenWeak}>
            <span className="tool-icon" style={{background:'#ff9600'}}>&#128170;</span>
            <span className="tool-label">약점 복습{wrongCount > 0 ? ` (${wrongCount})` : ''}</span>
          </button>
        </div>
      </div>

      <h2 className="map-title">학습 코스</h2>
      <div className="map-path">
        {lessonUnits.map((unit, index) => {
          const isCompleted = completedLessons.includes(unit.id);
          const isLocked = index > 0 && !completedLessons.includes(lessonUnits[index - 1].id);
          const isCurrent = !isCompleted && !isLocked;

          return (
            <div key={unit.id} className="map-node-wrapper">
              <button
                className={`map-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => !isLocked && onSelectLesson(unit)}
                disabled={isLocked}
                style={{ '--node-color': isLocked ? '#e5e5e5' : unit.color }}
              >
                <span className="node-icon">{unit.icon}</span>
                {isCompleted && <span className="check-mark">&#10003;</span>}
                {isLocked && <span className="lock-icon">&#128274;</span>}
              </button>
              <div className="node-label">
                <span className="node-title">{unit.title}</span>
                <span className="node-desc">{unit.description}</span>
              </div>
              {index < lessonUnits.length - 1 && <div className="path-line" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
