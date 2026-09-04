import { useState } from 'react';
import { useDraw } from '../../context/DrawContext';
import { formatNumber, exportCSV, exportTXT, downloadFile } from '../../utils/storage';
import { getGridColumns } from '../../utils/format';

export function VerifyCoupon() {
  const { state } = useDraw();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<'winner' | 'not-winner' | null>(null);

  const handleCheck = () => {
    const num = parseInt(query, 10);
    if (isNaN(num)) {
      setResult(null);
      return;
    }
    setResult(state.winners.includes(num) ? 'winner' : 'not-winner');
  };

  if (state.winners.length === 0) return null;

  return (
    <div className="verify-section">
      <h3>Verify Coupon</h3>
      <p className="section-desc">Check if a coupon number is a winner</p>
      <div className="verify-row">
        <input
          type="number"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setResult(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          placeholder="Enter coupon number"
          min={state.startNumber}
          max={state.endNumber}
          className="verify-input"
        />
        <button className="btn btn-secondary" onClick={handleCheck}>
          Check
        </button>
      </div>
      {result === 'winner' && (
        <div className="verify-result winner">
          <span className="verify-icon">✓</span>
          <div>
            <strong>WINNER</strong>
            <p>
              Coupon {formatNumber(parseInt(query, 10), state.endNumber)} is
              one of the selected numbers.
            </p>
          </div>
        </div>
      )}
      {result === 'not-winner' && (
        <div className="verify-result not-winner">
          <span className="verify-icon">✗</span>
          <div>
            <strong>NOT A WINNER</strong>
            <p>
              Coupon {formatNumber(parseInt(query, 10), state.endNumber)} was
              not selected.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ExportResults() {
  const { state } = useDraw();

  if (state.winners.length === 0) return null;

  const handleExportCSV = () => {
    const content = exportCSV(state.winners, state.endNumber);
    downloadFile(content, 'winning-numbers.csv', 'text/csv');
  };

  const handleExportTXT = () => {
    const content = exportTXT(state.winners, state.endNumber);
    downloadFile(content, 'winning-numbers.txt', 'text/plain');
  };

  return (
    <div className="export-section">
      <h3>Export Results</h3>
      <div className="export-buttons">
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          Export CSV
        </button>
        <button className="btn btn-secondary" onClick={handleExportTXT}>
          Export TXT
        </button>
      </div>
    </div>
  );
}

export function WinnerHistory() {
  const { state } = useDraw();

  if (state.winners.length === 0) return null;

  const columns = getGridColumns(state.winners.length);

  return (
    <div className="history-section">
      <h3>Draw Results</h3>
      <p className="section-desc">
        {state.winners.length} winners
        {state.drawTimestamp && (
          <> · {new Date(state.drawTimestamp).toLocaleString()}</>
        )}
      </p>
      <div
        className="history-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {state.winners.map((num) => (
          <span key={num} className="history-number">
            {formatNumber(num, state.endNumber)}
          </span>
        ))}
      </div>
    </div>
  );
}
