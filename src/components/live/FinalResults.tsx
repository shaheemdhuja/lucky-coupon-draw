import { motion } from 'framer-motion';
import { formatNumber } from '../../utils/storage';
import { getGridColumns } from '../../utils/format';

interface FinalResultsProps {
  eventTitle: string;
  subtitle: string;
  winners: number[];
  maxNumber: number;
}

export function FinalResults({
  eventTitle,
  subtitle,
  winners,
  maxNumber,
}: FinalResultsProps) {
  const columns = getGridColumns(winners.length);

  return (
    <motion.div
      className="final-results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="completion-banner"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
      >
        <h2 className="completion-title">🎉 DRAW COMPLETE 🎉</h2>
        <p className="completion-subtitle">
          {winners.length} WINNING COUPON NUMBERS HAVE BEEN SELECTED
        </p>
      </motion.div>

      <div className="final-header">
        <h1 className="final-event-title">{eventTitle}</h1>
        <p className="final-subtitle">{subtitle}</p>
      </div>

      <motion.div
        className="final-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.03 } },
        }}
      >
        {winners.map((num) => (
          <motion.div
            key={num}
            className="final-number"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            {formatNumber(num, maxNumber)}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
