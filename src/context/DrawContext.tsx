import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { DrawState, DrawStatus } from '../types';
import { DEFAULT_STATE } from '../types';
import { loadState, saveState } from '../utils/storage';
import { runDraw, validateConfig, buildEligiblePool } from '../utils/drawEngine';

type Action =
  | { type: 'LOAD'; state: DrawState }
  | { type: 'SET_CONFIG'; payload: Partial<DrawState> }
  | { type: 'ADD_EXCLUSION'; number: number }
  | { type: 'REMOVE_EXCLUSION'; number: number }
  | { type: 'CLEAR_EXCLUSIONS' }
  | { type: 'ENTER_LIVE' }
  | { type: 'EXIT_LIVE' }
  | { type: 'START_SPIN' }
  | { type: 'FINISH_SPIN' }
  | { type: 'REVEAL_NEXT'; count: number }
  | { type: 'FINISH_REVEAL' }
  | { type: 'RESET_DRAW' }
  | { type: 'RESET_ALL' };

function reducer(state: DrawState, action: Action): DrawState {
  switch (action.type) {
    case 'LOAD':
      return action.state;

    case 'SET_CONFIG': {
      if (state.status !== 'ready') return state;
      return { ...state, ...action.payload };
    }

    case 'ADD_EXCLUSION': {
      if (state.status !== 'ready') return state;
      const num = action.number;
      if (num < state.startNumber || num > state.endNumber) return state;
      if (state.excludedNumbers.includes(num)) return state;
      return {
        ...state,
        excludedNumbers: [...state.excludedNumbers, num].sort((a, b) => a - b),
      };
    }

    case 'REMOVE_EXCLUSION': {
      if (state.status !== 'ready') return state;
      return {
        ...state,
        excludedNumbers: state.excludedNumbers.filter((n) => n !== action.number),
      };
    }

    case 'CLEAR_EXCLUSIONS': {
      if (state.status !== 'ready') return state;
      return { ...state, excludedNumbers: [] };
    }

    case 'ENTER_LIVE':
      return { ...state, isLiveMode: true };

    case 'EXIT_LIVE':
      return { ...state, isLiveMode: false };

    case 'START_SPIN': {
      if (state.status !== 'ready') return state;
      const error = validateConfig(
        state.startNumber,
        state.endNumber,
        state.winnerCount,
        state.excludedNumbers
      );
      if (error) return state;

      const winners = runDraw(
        state.startNumber,
        state.endNumber,
        state.excludedNumbers,
        state.winnerCount
      );

      return {
        ...state,
        winners,
        status: 'spinning',
        revealedCount: 0,
        drawTimestamp: Date.now(),
      };
    }

    case 'FINISH_SPIN':
      return { ...state, status: 'revealing' };

    case 'REVEAL_NEXT': {
      const newCount = Math.min(
        state.revealedCount + action.count,
        state.winners.length
      );
      const newStatus: DrawStatus =
        newCount >= state.winners.length ? 'complete' : 'revealing';
      return { ...state, revealedCount: newCount, status: newStatus };
    }

    case 'FINISH_REVEAL':
      return {
        ...state,
        revealedCount: state.winners.length,
        status: 'complete',
      };

    case 'RESET_DRAW':
      return {
        ...state,
        winners: [],
        status: 'ready',
        revealedCount: 0,
        drawTimestamp: null,
        isLiveMode: state.isLiveMode,
      };

    case 'RESET_ALL':
      return { ...DEFAULT_STATE };

    default:
      return state;
  }
}

interface DrawContextValue {
  state: DrawState;
  dispatch: React.Dispatch<Action>;
  availableCount: number;
  configError: string | null;
  setConfig: (payload: Partial<DrawState>) => void;
  addExclusion: (num: number) => void;
  removeExclusion: (num: number) => void;
  clearExclusions: () => void;
  enterLive: () => void;
  exitLive: () => void;
  startSpin: () => void;
  finishSpin: () => void;
  revealNext: (count: number) => void;
  finishReveal: () => void;
  resetDraw: () => void;
  resetAll: () => void;
  isDrawLocked: boolean;
}

const DrawContext = createContext<DrawContextValue | null>(null);

export function DrawProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  useEffect(() => {
    dispatch({ type: 'LOAD', state: loadState() });
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const availableCount = buildEligiblePool(
    state.startNumber,
    state.endNumber,
    state.excludedNumbers
  ).length;

  const configError = validateConfig(
    state.startNumber,
    state.endNumber,
    state.winnerCount,
    state.excludedNumbers
  );

  const isDrawLocked = state.status !== 'ready';

  const setConfig = useCallback(
    (payload: Partial<DrawState>) => dispatch({ type: 'SET_CONFIG', payload }),
    []
  );
  const addExclusion = useCallback(
    (num: number) => dispatch({ type: 'ADD_EXCLUSION', number: num }),
    []
  );
  const removeExclusion = useCallback(
    (num: number) => dispatch({ type: 'REMOVE_EXCLUSION', number: num }),
    []
  );
  const clearExclusions = useCallback(
    () => dispatch({ type: 'CLEAR_EXCLUSIONS' }),
    []
  );
  const enterLive = useCallback(() => dispatch({ type: 'ENTER_LIVE' }), []);
  const exitLive = useCallback(() => dispatch({ type: 'EXIT_LIVE' }), []);
  const startSpin = useCallback(() => dispatch({ type: 'START_SPIN' }), []);
  const finishSpin = useCallback(() => dispatch({ type: 'FINISH_SPIN' }), []);
  const revealNext = useCallback(
    (count: number) => dispatch({ type: 'REVEAL_NEXT', count }),
    []
  );
  const finishReveal = useCallback(
    () => dispatch({ type: 'FINISH_REVEAL' }),
    []
  );
  const resetDraw = useCallback(() => dispatch({ type: 'RESET_DRAW' }), []);
  const resetAll = useCallback(() => dispatch({ type: 'RESET_ALL' }), []);

  return (
    <DrawContext.Provider
      value={{
        state,
        dispatch,
        availableCount,
        configError,
        setConfig,
        addExclusion,
        removeExclusion,
        clearExclusions,
        enterLive,
        exitLive,
        startSpin,
        finishSpin,
        revealNext,
        finishReveal,
        resetDraw,
        resetAll,
        isDrawLocked,
      }}
    >
      {children}
    </DrawContext.Provider>
  );
}

export function useDraw() {
  const ctx = useContext(DrawContext);
  if (!ctx) throw new Error('useDraw must be used within DrawProvider');
  return ctx;
}
