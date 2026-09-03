import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '../../utils/storage';
import { getRevealBatchSize, getRevealInterval, getGridColumns } from '../../utils/format';
import { playRevealSound } from '../../utils/sound';

interface WinnerRevealProps {
  winners: number[];
  revealedCount: number;
  maxNumber: number;
  onRevealComplete: () => void;
  onRevealBatch: (count: number) => void;
  soundEnabled: boolean;
  isRevealing: boolean;
}

export function WinnerReveal({
  winners,
  revealedCount,
  maxNumber,
  onRevealComplete,
  onRevealBatch,
  soundEnabled,
  isRevealing,
}: WinnerRevealProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const batchSize = getRevealBatchSize(winners.length);
  const interval = getRevealInterval(winners.length);
  const columns = getGridColumns(winners.length);

  useEffect(() => {
    if (!isRevealing || revealedCount >= winners.length) {
      if (revealedCount >= winners.length && isRevealing) {
        onRevealComplete();
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      if (soundEnabled) playRevealSound();
      onRevealBatch(batchSize);
    }, interval);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    isRevealing,
    revealedCount,
    winners.length,
    batchSize,
    interval,
    onRevealBatch,
    onRevealComplete,
    soundEnabled,
  ]);

  const revealed = winners.slice(0, revealedCount);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="winner-reveal">
      <AnimatePresence>
        {revealedCount === 0 && isRevealing && (
          <motion.p
            className="reveal-intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            AND THE WINNING NUMBERS ARE...
          </motion.p>
        )}
      </AnimatePresence>

      {revealedCount > 0 && (
        <>
          <motion.h2
            className="reveal-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            WINNING NUMBERS
          </motion.h2>

          <motion.p
            className="reveal-progress"
            key={revealedCount}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {revealedCount} / {winners.length}
          </motion.p>

          <div
            className="winner-grid"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            <AnimatePresence mode="popLayout">
              {revealed.map((num, i) => (
                <motion.div
                  key={num}
                  className="winner-number"
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { opacity: 0, scale: 0.5, y: 20 }
                  }
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.4,
                    delay: prefersReducedMotion
                      ? 0
                      : (i % batchSize) * 0.06,
                  }}
                >
                  {formatNumber(num, maxNumber)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
