import React from 'react';
import { hiragana, katakana } from '../data/lessons';
import { useSound } from '../hooks/useSound';

const GROUPS_ORDER = ['모음', 'か행', 'さ행', 'た행', 'な행', 'は행', 'ま행', 'や행', 'ら행', 'わ행'];
const KATAKANA_GROUPS = ['모음', 'カ행', 'サ행', 'タ행', 'ナ행', 'ハ행', 'マ행', 'ヤ행', 'ラ행', 'ワ행'];

export default function KanaChart({ type, completedLessons, onClose, onStartLesson }) {
  const { speakJapanese } = useSound();
  const data = type === 'hiragana' ? hiragana : katakana;
  const groups = type === 'hiragana' ? GROUPS_ORDER : KATAKANA_GROUPS;

  const grouped = {};
  data.forEach(item => {
    if (!grouped[item.group]) grouped[item.group] = [];
    grouped[item.group].push(item);
  });

  return (
    <div className="chart-overlay">
      <div className="chart-container">
        <div className="chart-header">
          <h2>{type === 'hiragana' ? '히라가나' : '가타카나'} 50음도</h2>
          <button className="btn-quit" onClick={onClose}>&times;</button>
        </div>
        <p className="chart-desc">글자를 탭하면 발음을 들을 수 있어요</p>

        <div className="chart-grid">
          {groups.map(group => {
            const items = grouped[group];
            if (!items) return null;
            return (
              <div key={group} className="chart-row">
                <span className="chart-group-label">{group}</span>
                <div className="chart-cells">
                  {items.map(item => (
                    <button
                      key={item.kana}
                      className="chart-cell"
                      onClick={() => speakJapanese(item.exWord || item.kana)}
                      title={`${item.romaji} — ${item.exWord} (${item.exMeaning})`}
                    >
                      <span className="chart-kana">{item.kana}</span>
                      <span className="chart-romaji">{item.romaji}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn-primary chart-start-btn" onClick={onStartLesson}>
          학습 시작하기
        </button>
      </div>
    </div>
  );
}
