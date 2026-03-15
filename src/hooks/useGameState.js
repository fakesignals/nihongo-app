import { useState, useEffect } from 'react';

const STORAGE_KEY = 'nihongo-app-state';

const getInitialState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return {
    xp: 0,
    streak: 0,
    lastStudyDate: null,
    completedLessons: [],
    wrongAnswers: [], // SRS용: { item, nextReview, interval }
    hearts: 5,
    level: 1,
  };
};

export function useGameState() {
  const [state, setState] = useState(getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // 스트릭 체크
  useEffect(() => {
    const today = new Date().toDateString();
    if (state.lastStudyDate) {
      const last = new Date(state.lastStudyDate);
      const diff = Math.floor((new Date(today) - last) / (1000 * 60 * 60 * 24));
      if (diff > 1) {
        setState(s => ({ ...s, streak: 0 }));
      }
    }
  }, []);

  const addXP = (amount) => {
    setState(s => {
      const newXP = s.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      const today = new Date().toDateString();
      const isNewDay = s.lastStudyDate !== today;
      return {
        ...s,
        xp: newXP,
        level: newLevel,
        streak: isNewDay ? s.streak + 1 : s.streak,
        lastStudyDate: today,
      };
    });
  };

  const completeLesson = (lessonId) => {
    setState(s => ({
      ...s,
      completedLessons: s.completedLessons.includes(lessonId)
        ? s.completedLessons
        : [...s.completedLessons, lessonId],
      hearts: 5, // 레슨 완료시 하트 리셋
    }));
  };

  const loseHeart = () => {
    setState(s => ({ ...s, hearts: Math.max(0, s.hearts - 1) }));
  };

  const addWrongAnswer = (item) => {
    setState(s => ({
      ...s,
      wrongAnswers: [
        ...s.wrongAnswers.filter(w => w.item.kana !== item.kana && w.item.word !== item.word),
        { item, nextReview: Date.now() + 60000, interval: 1 }, // 1분 후 복습
      ],
    }));
  };

  const resetState = () => {
    setState({
      xp: 0,
      streak: 0,
      lastStudyDate: null,
      completedLessons: [],
      wrongAnswers: [],
      hearts: 5,
      level: 1,
    });
  };

  return {
    ...state,
    addXP,
    completeLesson,
    loseHeart,
    addWrongAnswer,
    resetState,
  };
}
