import { useRef, useCallback } from 'react';

let jaVoice = null;
let voicesLoaded = false;

function loadJapaneseVoice() {
  if (voicesLoaded) return;
  const voices = speechSynthesis.getVoices();
  jaVoice = voices.find(v => v.lang.startsWith('ja')) || null;
  if (voices.length > 0) voicesLoaded = true;
}

// 브라우저 음성 목록은 비동기로 로드됨
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = loadJapaneseVoice;
  loadJapaneseVoice();
}

export function useSound() {
  const ctxRef = useRef(null);

  const getCtx = () => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  };

  const playCorrect = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 523.25;
      gain.gain.value = 0.3;
      osc.start();
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) { /* ignore */ }
  }, []);

  const playWrong = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = 200;
      gain.gain.value = 0.2;
      osc.start();
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) { /* ignore */ }
  }, []);

  const speakJapanese = useCallback((text) => {
    try {
      speechSynthesis.cancel(); // 이전 발음 중단
      loadJapaneseVoice();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.75;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      if (jaVoice) utterance.voice = jaVoice;

      speechSynthesis.speak(utterance);
    } catch (e) { /* ignore */ }
  }, []);

  return { playCorrect, playWrong, speakJapanese };
}
