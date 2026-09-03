import { motion } from 'framer-motion';

interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSpinning: boolean;
}

export function SpinButton({ onClick, disabled, isSpinning }: SpinButtonProps) {
  return (
    <motion.button
      className={`spin-button ${isSpinning ? 'spinning' : ''}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      aria-label={isSpinning ? 'Spinning' : 'Spin the wheel'}
    >
      <span className="spin-button-inner">
        {isSpinning ? 'SPINNING...' : 'SPIN'}
      </span>
    </motion.button>
  );
}
