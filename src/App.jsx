import React, { useState } from 'react';
import Header from './components/Header';
import LessonMap from './components/LessonMap';
import KanaChart from './components/KanaChart';
import LearnPhase from './components/LearnPhase';
import CardStudy from './components/CardStudy';
import SpeedQuiz from './components/SpeedQuiz';
import ConfusableQuiz from './components/ConfusableQuiz';
import MatchingGame from './components/MatchingGame';
import WritingPractice from './components/WritingPractice';
import WeakReview from './components/WeakReview';
import Quiz from './components/Quiz';
import { useGameState } from './hooks/useGameState';
import { useSound } from './hooks/useSound';
import './App.css';

function App() {
  const game = useGameState();
  const { playCorrect, playWrong } = useSound();
  const [currentUnit, setCurrentUnit] = useState(null);
  const [phase, setPhase] = useState('map');

  const goHome = () => { setCurrentUnit(null); setPhase('map'); };

  const handleSelectLesson = (unit) => {
    setCurrentUnit(unit);
    if (unit.type === 'hiragana' || unit.type === 'katakana') {
      setPhase('chart');
    } else {
      setPhase('learn');
    }
  };

  const handleCorrect = (item) => {
    playCorrect();
    game.addXP(10);
  };

  const handleWrong = (item) => {
    playWrong();
    game.loseHeart();
    game.addWrongAnswer(item);
  };

  const handleComplete = (score, total) => {
    if (score >= Math.ceil(total * 0.5)) {
      game.completeLesson(currentUnit.id);
    }
    goHome();
  };

  return (
    <div className="app">
      <Header
        xp={game.xp}
        streak={game.streak}
        hearts={game.hearts}
        level={game.level}
        onHomeClick={goHome}
      />
      <main className="main-content">
        {phase === 'cards' && <CardStudy onClose={goHome} />}
        {phase === 'speed' && <SpeedQuiz onClose={goHome} />}
        {phase === 'confuse' && <ConfusableQuiz onClose={goHome} />}
        {phase === 'matching' && <MatchingGame onClose={goHome} />}
        {phase === 'writing' && <WritingPractice onClose={goHome} />}
        {phase === 'weak' && <WeakReview wrongAnswers={game.wrongAnswers} onClose={goHome} />}
        {phase === 'chart' && currentUnit && (
          <KanaChart
            type={currentUnit.type}
            completedLessons={game.completedLessons}
            onClose={goHome}
            onStartLesson={() => setPhase('learn')}
          />
        )}
        {phase === 'learn' && currentUnit && (
          <LearnPhase unit={currentUnit} onComplete={() => setPhase('quiz')} onQuit={goHome} />
        )}
        {phase === 'quiz' && currentUnit && (
          <Quiz
            unit={currentUnit}
            hearts={game.hearts}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            onComplete={handleComplete}
            onQuit={goHome}
          />
        )}
        {phase === 'map' && (
          <LessonMap
            completedLessons={game.completedLessons}
            wrongCount={game.wrongAnswers.length}
            onSelectLesson={handleSelectLesson}
            onOpenCards={() => setPhase('cards')}
            onOpenSpeed={() => setPhase('speed')}
            onOpenConfuse={() => setPhase('confuse')}
            onOpenMatching={() => setPhase('matching')}
            onOpenWriting={() => setPhase('writing')}
            onOpenWeak={() => setPhase('weak')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
