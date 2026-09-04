import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraw } from '../../context/DrawContext';
import { SpinWheel, SPIN_DURATION } from './SpinWheel';
import { SpinButton } from './SpinButton';
import { WinnerReveal } from './WinnerReveal';
import { FinalResults } from './FinalResults';
import { Particles } from './Particles';
import { Confetti } from './Confetti';
import {
  playSpinSound,
  playSpinLoop,
  playCompleteSound,
} from '../../utils/sound';

interface LiveDrawProps {
  onExitLive: () => void;
}

export function LiveDraw({ onExitLive }: LiveDrawProps) {
  const {
    state,
    startSpin,
    finishSpin,
    revealNext,
    finishReveal,
    isDrawLocked,
  } = useDraw();

  const cleanupSoundRef = useRef<(() => void) | null>(null);

  const handleSpin = useCallback(() => {
    if (isDrawLocked) return;
    if (state.soundEnabled) playSpinSound();
    startSpin();
  }, [isDrawLocked, startSpin, state.soundEnabled]);

  useEffect(() => {
    if (state.status === 'spinning') {
      if (state.soundEnabled) {
        cleanupSoundRef.current = playSpinLoop(() => {}, SPIN_DURATION);
      }
      const timer = setTimeout(() => {
        cleanupSoundRef.current?.();
        finishSpin();
      }, SPIN_DURATION);
      return () => {
        clearTimeout(timer);
        cleanupSoundRef.current?.();
      };
    }
  }, [state.status, finishSpin, state.soundEnabled]);

  useEffect(() => {
    if (state.status === 'complete' && state.soundEnabled) {
      playCompleteSound();
    }
  }, [state.status, state.soundEnabled]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (
      prefersReducedMotion &&
      state.status === 'revealing' &&
      state.revealedCount < state.winners.length
    ) {
      finishReveal();
    }
  }, [state.status, state.revealedCount, state.winners.length, finishReveal]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExitLive();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onExitLive]);

  const showWheel =
    state.status === 'ready' || state.status === 'spinning';
  const showReveal =
    state.status === 'revealing' ||
    (state.status === 'complete' && state.revealedCount < state.winners.length);
  const showFinal =
    state.status === 'complete' &&
    state.revealedCount >= state.winners.length;

  return (
    <div className="live-draw">
      <Particles />
      {state.status === 'complete' && <Confetti />}

      <button
        className="live-exit-btn"
        onClick={onExitLive}
        title="Exit live mode (Esc)"
        aria-label="Exit live mode"
      >
        ⚙
      </button>

      <div className="live-header">
        <motion.h1
          className="live-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {state.eventTitle}
        </motion.h1>
        <motion.p
          className="live-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {state.subtitle}
        </motion.p>
      </div>

      <div className="live-content">
        <AnimatePresence mode="wait">
          {showWheel && (
            <motion.div
              key="wheel"
              className="wheel-section"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
              transition={{ duration: 0.6 }}
            >
              <SpinWheel
                isSpinning={state.status === 'spinning'}
                startNumber={state.startNumber}
                endNumber={state.endNumber}
                winnerCount={state.winnerCount}
              />

              <SpinButton
                onClick={handleSpin}
                disabled={isDrawLocked}
                isSpinning={state.status === 'spinning'}
              />

              {state.status === 'ready' && (
                <p className="ready-counter">
                  0 / {state.winnerCount} SELECTED
                </p>
              )}
            </motion.div>
          )}

          {showReveal && !showFinal && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WinnerReveal
                winners={state.winners}
                revealedCount={state.revealedCount}
                maxNumber={state.endNumber}
                onRevealComplete={finishReveal}
                onRevealBatch={revealNext}
                soundEnabled={state.soundEnabled}
                isRevealing={state.status === 'revealing'}
              />
            </motion.div>
          )}

          {showFinal && (
            <motion.div
              key="final"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FinalResults
                winners={state.winners}
                maxNumber={state.endNumber}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
