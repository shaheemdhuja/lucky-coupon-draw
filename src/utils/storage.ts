import type { DrawState } from '../types';
import { DEFAULT_STATE, STORAGE_KEY } from '../types';

export function loadState(): DrawState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as DrawState;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: DrawState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportCSV(winners: number[], maxNumber: number): string {
  const header = 'Number';
  const rows = winners.map((n) => formatNumber(n, maxNumber));
  return [header, ...rows].join('\n');
}

export function exportTXT(winners: number[], maxNumber: number): string {
  return winners.map((n) => formatNumber(n, maxNumber)).join('\n');
}

export function formatNumber(num: number, maxNumber: number): string {
  const digits = String(maxNumber).length;
  return String(num).padStart(digits, '0');
}

export function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
