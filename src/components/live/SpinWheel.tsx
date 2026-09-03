import { useEffect, useRef, useCallback } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

interface SpinWheelProps {
  isSpinning: boolean;
  startNumber: number;
  endNumber: number;
  winnerCount: number;
}

const SEGMENT_COUNT = 24;
const SPIN_DURATION = 6500;

export function SpinWheel({
  isSpinning,
  startNumber,
  endNumber,
  winnerCount,
}: SpinWheelProps) {
  const controls = useAnimationControls();
  const completedRef = useRef(false);
  const rotationRef = useRef(0);

  const runSpin = useCallback(async () => {
    if (completedRef.current) return;
    completedRef.current = true;

    const extraRotations = 5 + Math.random() * 3;
    const finalAngle = extraRotations * 360 + Math.random() * 360;
    rotationRef.current += finalAngle;

    await controls.start({
      rotate: rotationRef.current,
      transition: {
        duration: SPIN_DURATION / 1000,
        ease: [0.15, 0.85, 0.25, 1],
      },
    });
  }, [controls]);

  useEffect(() => {
    if (isSpinning) {
      completedRef.current = false;
      runSpin();
    }
  }, [isSpinning, runSpin]);

  const colors = [
    '#1a1208', '#2a1f0e', '#1a1208', '#2a1f0e',
    '#3d2e14', '#2a1f0e', '#1a1208', '#3d2e14',
  ];

  const goldColors = [
    '#c9a227', '#d4af37', '#b8941f', '#e6c84a',
    '#c9a227', '#d4af37', '#b8941f', '#e6c84a',
  ];

  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const innerR = 60;

  const segments = Array.from({ length: SEGMENT_COUNT }, (_, i) => {
    const startAngle = (i / SEGMENT_COUNT) * 360 - 90;
    const endAngle = ((i + 1) / SEGMENT_COUNT) * 360 - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + outerR * Math.cos(startRad);
    const y1 = cy + outerR * Math.sin(startRad);
    const x2 = cx + outerR * Math.cos(endRad);
    const y2 = cy + outerR * Math.sin(endRad);
    const x3 = cx + innerR * Math.cos(endRad);
    const y3 = cy + innerR * Math.sin(endRad);
    const x4 = cx + innerR * Math.cos(startRad);
    const y4 = cy + innerR * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    const midAngle = ((startAngle + endAngle) / 2 * Math.PI) / 180;
    const textR = (outerR + innerR) / 2;
    const tx = cx + textR * Math.cos(midAngle);
    const ty = cy + textR * Math.sin(midAngle);
    const textAngle = (startAngle + endAngle) / 2 + 90;

    const sampleNum =
      startNumber +
      Math.floor((i / SEGMENT_COUNT) * (endNumber - startNumber + 1));

    return { path, tx, ty, textAngle, sampleNum, i };
  });

  return (
    <div className="wheel-container">
      <div className="wheel-pointer" aria-hidden="true">
        <svg width="40" height="50" viewBox="0 0 40 50">
          <polygon
            points="20,50 0,10 40,10"
            fill="#d4af37"
            stroke="#f5e6a3"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <motion.div
        className="wheel-rotator"
        animate={controls}
        initial={{ rotate: 0 }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="wheel-svg"
          role="img"
          aria-label="Spin wheel"
        >
          <defs>
            <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3d2e14" />
              <stop offset="70%" stopColor="#1a1208" />
              <stop offset="100%" stopColor="#0d0906" />
            </radialGradient>
            <filter id="wheelShadow">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#d4af37" floodOpacity="0.3" />
            </filter>
          </defs>

          <circle
            cx={cx}
            cy={cy}
            r={outerR + 6}
            fill="none"
            stroke="#d4af37"
            strokeWidth="3"
            opacity="0.6"
          />
          <circle
            cx={cx}
            cy={cy}
            r={outerR + 10}
            fill="none"
            stroke="#d4af37"
            strokeWidth="1"
            opacity="0.3"
          />

          {segments.map(({ path, tx, ty, textAngle, sampleNum, i }) => (
            <g key={i}>
              <path
                d={path}
                fill={i % 2 === 0 ? colors[i % colors.length] : goldColors[i % goldColors.length]}
                stroke="#1a1208"
                strokeWidth="0.5"
                opacity={i % 2 === 0 ? 1 : 0.85}
              />
              <text
                x={tx}
                y={ty}
                fill={i % 2 === 0 ? '#d4af37' : '#1a1208'}
                fontSize="14"
                fontWeight="700"
                fontFamily="Inter, sans-serif"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textAngle}, ${tx}, ${ty})`}
              >
                {String(sampleNum).padStart(String(endNumber).length, '0')}
              </text>
            </g>
          ))}

          <circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill="url(#wheelGlow)"
            filter="url(#wheelShadow)"
          />
          <circle
            cx={cx}
            cy={cy}
            r={innerR - 4}
            fill="none"
            stroke="#d4af37"
            strokeWidth="2"
            opacity="0.7"
          />
          <text
            x={cx}
            y={cy - 8}
            fill="#d4af37"
            fontSize="11"
            fontFamily="Cinzel, serif"
            textAnchor="middle"
            letterSpacing="2"
          >
            LUCKY
          </text>
          <text
            x={cx}
            y={cy + 10}
            fill="#f5e6a3"
            fontSize="13"
            fontWeight="700"
            fontFamily="Cinzel, serif"
            textAnchor="middle"
            letterSpacing="1"
          >
            DRAW
          </text>
        </svg>
      </motion.div>

      <div className="wheel-info">
        <span className="wheel-range">
          {String(startNumber).padStart(String(endNumber).length, '0')} –{' '}
          {String(endNumber).padStart(String(endNumber).length, '0')}
        </span>
        <span className="wheel-winners">{winnerCount} WINNERS</span>
      </div>
    </div>
  );
}

export { SPIN_DURATION };
