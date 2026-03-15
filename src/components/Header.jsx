import React from 'react';

export default function Header({ xp, streak, hearts, level, onHomeClick }) {
  return (
    <header className="header">
      <div className="header-left" onClick={onHomeClick} style={{ cursor: 'pointer' }}>
        <span className="logo">nihongo</span>
      </div>
      <div className="header-stats">
        <div className="stat streak" title="연속 출석">
          <span className="stat-icon">&#128293;</span>
          <span>{streak}</span>
        </div>
        <div className="stat xp" title="경험치">
          <span className="stat-icon">&#9733;</span>
          <span>{xp} XP</span>
        </div>
        <div className="stat hearts" title="하트">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`heart ${i < hearts ? 'active' : 'empty'}`}>
              &#9829;
            </span>
          ))}
        </div>
        <div className="stat level" title="레벨">
          <span>Lv.{level}</span>
        </div>
      </div>
    </header>
  );
}
