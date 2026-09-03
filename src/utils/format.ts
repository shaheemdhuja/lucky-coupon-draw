export { formatNumber } from './storage';

export function getGridColumns(count: number): number {
  if (count <= 10) return count;
  if (count <= 20) return 5;
  if (count <= 50) return 5;
  if (count <= 100) return 10;
  return 10;
}

export function getRevealBatchSize(total: number): number {
  if (total <= 10) return 1;
  if (total <= 25) return 3;
  if (total <= 50) return 5;
  if (total <= 100) return 10;
  return 10;
}

export function getRevealInterval(total: number): number {
  if (total <= 10) return 600;
  if (total <= 25) return 400;
  if (total <= 50) return 350;
  if (total <= 100) return 300;
  return 250;
}
