import { useState } from 'react';
import { useDraw } from '../../context/DrawContext';
import { formatNumber } from '../../utils/storage';
import { VerifyCoupon, ExportResults, WinnerHistory } from './ResultsPanel';

export function OrganizerPanel() {
  const {
    state,
    setConfig,
    addExclusion,
    removeExclusion,
    clearExclusions,
    enterLive,
    resetDraw,
    resetAll,
    availableCount,
    configError,
    isDrawLocked,
  } = useDraw();

  const [exclusionInput, setExclusionInput] = useState('');
  const [exclusionSearch, setExclusionSearch] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [exclusionError, setExclusionError] = useState('');

  const handleAddExclusion = () => {
    const num = parseInt(exclusionInput, 10);
    if (isNaN(num)) {
      setExclusionError('Enter a valid number');
      return;
    }
    if (num < state.startNumber || num > state.endNumber) {
      setExclusionError(
        `Number must be between ${state.startNumber} and ${state.endNumber}`
      );
      return;
    }
    if (state.excludedNumbers.includes(num)) {
      setExclusionError('Number already excluded');
      return;
    }
    addExclusion(num);
    setExclusionInput('');
    setExclusionError('');
  };

  const filteredExclusions = state.excludedNumbers.filter((n) =>
    exclusionSearch ? String(n).includes(exclusionSearch) : true
  );

  const handleResetDraw = () => {
    resetDraw();
    setShowResetConfirm(false);
  };

  const handleResetAll = () => {
    resetAll();
    setShowResetAllConfirm(false);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="organizer">
      <header className="organizer-header">
        <div>
          <h1>Lucky Coupon Draw</h1>
          <p className="organizer-tagline">Organizer Control Panel</p>
        </div>
        {isDrawLocked && (
          <span className="lock-badge">Draw in progress / complete</span>
        )}
      </header>

      <div className="organizer-grid">
        <section className="panel">
          <h2>Event Settings</h2>
          <div className="form-group">
            <label htmlFor="eventTitle">Event Title</label>
            <input
              id="eventTitle"
              type="text"
              value={state.eventTitle}
              onChange={(e) => setConfig({ eventTitle: e.target.value })}
              disabled={isDrawLocked}
              placeholder="ABC Inauguration"
            />
          </div>
          <div className="form-group">
            <label htmlFor="subtitle">Subtitle</label>
            <input
              id="subtitle"
              type="text"
              value={state.subtitle}
              onChange={(e) => setConfig({ subtitle: e.target.value })}
              disabled={isDrawLocked}
              placeholder="Lucky Coupon Draw"
            />
          </div>
        </section>

        <section className="panel">
          <h2>Draw Settings</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startNumber">Start Number</label>
              <input
                id="startNumber"
                type="number"
                value={state.startNumber}
                onChange={(e) =>
                  setConfig({ startNumber: parseInt(e.target.value, 10) || 0 })
                }
                disabled={isDrawLocked}
                min={0}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endNumber">End Number</label>
              <input
                id="endNumber"
                type="number"
                value={state.endNumber}
                onChange={(e) =>
                  setConfig({ endNumber: parseInt(e.target.value, 10) || 0 })
                }
                disabled={isDrawLocked}
                min={0}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="winnerCount">Number of Winners</label>
            <input
              id="winnerCount"
              type="number"
              value={state.winnerCount}
              onChange={(e) =>
                setConfig({ winnerCount: parseInt(e.target.value, 10) || 1 })
              }
              disabled={isDrawLocked}
              min={1}
            />
          </div>
          <div className="pool-info">
            <span>Available numbers: <strong>{availableCount}</strong></span>
            <span>
              Range: {formatNumber(state.startNumber, state.endNumber)} –{' '}
              {formatNumber(state.endNumber, state.endNumber)}
            </span>
          </div>
          {configError && <p className="error-msg">{configError}</p>}
        </section>

        <section className="panel">
          <h2>Exclusions</h2>
          <p className="section-desc">
            Remove specific numbers from the draw pool
          </p>
          <div className="exclusion-add">
            <input
              type="number"
              value={exclusionInput}
              onChange={(e) => {
                setExclusionInput(e.target.value);
                setExclusionError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddExclusion()}
              placeholder="Number to exclude"
              disabled={isDrawLocked}
              min={state.startNumber}
              max={state.endNumber}
            />
            <button
              className="btn btn-secondary"
              onClick={handleAddExclusion}
              disabled={isDrawLocked}
            >
              Add
            </button>
          </div>
          {exclusionError && <p className="error-msg">{exclusionError}</p>}

          {state.excludedNumbers.length > 0 && (
            <>
              <div className="exclusion-search">
                <input
                  type="text"
                  value={exclusionSearch}
                  onChange={(e) => setExclusionSearch(e.target.value)}
                  placeholder="Search exclusions..."
                  disabled={isDrawLocked}
                />
                <button
                  className="btn btn-ghost"
                  onClick={clearExclusions}
                  disabled={isDrawLocked}
                >
                  Clear All
                </button>
              </div>
              <div className="exclusion-list">
                {filteredExclusions.map((num) => (
                  <span key={num} className="exclusion-tag">
                    {formatNumber(num, state.endNumber)}
                    {!isDrawLocked && (
                      <button
                        onClick={() => removeExclusion(num)}
                        aria-label={`Remove ${num}`}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
                {filteredExclusions.length === 0 && exclusionSearch && (
                  <span className="no-results">No matches</span>
                )}
              </div>
              <p className="exclusion-count">
                {state.excludedNumbers.length} excluded
              </p>
            </>
          )}
        </section>

        <section className="panel">
          <h2>Options</h2>
          <div className="form-group toggle-group">
            <label htmlFor="soundToggle">Sound Effects</label>
            <button
              id="soundToggle"
              className={`toggle-btn ${state.soundEnabled ? 'on' : 'off'}`}
              onClick={() => setConfig({ soundEnabled: !state.soundEnabled })}
              disabled={isDrawLocked}
            >
              {state.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </section>

        <section className="panel actions-panel">
          <h2>Actions</h2>
          <div className="action-buttons">
            <button
              className="btn btn-primary btn-large"
              onClick={enterLive}
              disabled={!!configError}
            >
              Enter Live Mode
            </button>
            <button
              className="btn btn-secondary"
              onClick={toggleFullscreen}
            >
              Fullscreen
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowResetConfirm(true)}
              disabled={state.status === 'ready'}
            >
              Reset Draw
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setShowResetAllConfirm(true)}
              disabled={isDrawLocked}
            >
              Reset Everything
            </button>
          </div>
        </section>

        <section className="panel results-panel">
          <WinnerHistory />
          <ExportResults />
          <VerifyCoupon />
        </section>
      </div>

      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reset this draw?</h3>
            <p>The current winning numbers will be cleared.</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleResetDraw}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetAllConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reset everything?</h3>
            <p>
              All configuration, exclusions, and results will be cleared. This
              cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowResetAllConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleResetAll}>
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
