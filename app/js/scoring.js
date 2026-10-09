// Pure scoring and "dopa" curves (kept separate from the director for testing).

export const BASIC_SCORE = 100;
export const EXTRA_BASE = 10;

// Points for the k-th (0-based) extra problem grow gently: 10, 15, 20, ...
// A very fast player (20-25 extra problems in 90 s) ends in the 1000s.
export const EXTRA_STEP = 5;
export const extraPoints = (k) => EXTRA_BASE + EXTRA_STEP * k;
export const extraTotal = (n) => EXTRA_BASE * n + EXTRA_STEP * (n * (n - 1)) / 2;

// Dopa is tracked as log10 and grows one answer cell at a time. The base
// curves below are what a player with no combo gets; combos multiply each
// step (see comboMult), so a steady combo lands back near the old targets.
// Without combo the basic set ends near 10^2.3 (about 200); a full combo
// doubles every step after 20 cells and ends near 10 тыс.
export const BASIC_DOPA_L = 2.3;
export function basicDopaL(frac) {
  const f = Math.min(1, Math.max(0, frac));
  return BASIC_DOPA_L * f ** 1.15;
}
// Extra problems follow a saturating curve on top of the basic set.
const EXTRA_SPAN = 3.0; const EXTRA_TAU = 10;
export const extraDopaL = (n) => BASIC_DOPA_L + EXTRA_SPAN * (1 - Math.exp(-n / EXTRA_TAU));
export const extraProblemGain = (k) => extraDopaL(k + 1) - extraDopaL(k);
// Hard ceiling: about 1,2 млрд, whatever the combo.
export const DOPA_MAX_L = 9.08;

// ---------------------------------------------------------------- combo
// One combo per correct answer cell, carried across problems. It does not
// change the score; it only makes dopa grow faster: the multiplier rises
// evenly from x1.0 and tops out at x2.0 at 20 combo.
export const COMBO_DOPA = { max: 2, full: 20 };
export const comboMult = (combo) => 1 + (COMBO_DOPA.max - 1) * Math.min(1, Math.max(0, combo) / COMBO_DOPA.full);
export const comboMaxed = (combo) => combo >= COMBO_DOPA.full;

// Add one answer cell's worth of dopa. `base` is the no-combo step (log10).
export function addDopa(L, base, combo) {
  return Math.min(DOPA_MAX_L, L + Math.max(0.003, base) * comboMult(combo));
}

// Time allowed to enter the next answer cell before the combo breaks
// (provisional). Harder skills (higher grade) get longer; the first cell of
// a problem adds time to read it.
export const COMBO_TIME = { base: 3000, perGrade: 600, read: 2500 };
export function comboWindowMs(grade = 3, first = false) {
  const g = Math.min(6, Math.max(1, grade || 3));
  return COMBO_TIME.base + COMBO_TIME.perGrade * (g - 1) + (first ? COMBO_TIME.read : 0);
}
// Milestones worth a bigger show: 10, 20, 30, 50, 75, 100, then every 50.
export const comboMilestone = (c) => [10, 20, 30, 50, 75].includes(c) || (c >= 100 && c % 50 === 0);

// Russian short scale: тысяча, миллион, миллиард, ...
const UNITS = [[33, 'дец.'], [30, 'нон.'], [27, 'окт.'], [24, 'септ.'], [21, 'секст.'], [18, 'квинт.'], [15, 'квадр.'], [12, 'трлн'], [9, 'млрд'], [6, 'млн'], [3, 'тыс.']];

// Below 10 000 the number is shown whole; above, with a unit: "31 тыс.", "1,6 млн".
export function fmtDopa(L) {
  if (!Number.isFinite(L) || L >= 36) return '∞';
  if (L < 4) return Math.round(10 ** L).toLocaleString('ru-RU');
  const u = UNITS.find(([e]) => L >= e - 1e-9);
  const m = 10 ** (L - u[0]);
  return `${m < 10 ? m.toFixed(1).replace('.', ',') : String(Math.floor(m))} ${u[1]}`;
}

// Milestones: every power of ten from 100 (100, 1000, 10 тыс., 100 тыс., 1 млн, ...).
// The milestone is its own label.
export function unitOf(L) {
  if (!Number.isFinite(L) || L >= 36) return '∞';
  if (L < 2 - 1e-9) return '';
  const e = Math.floor(L + 1e-9);
  if (e < 4) return String(10 ** e);
  const u = UNITS.find(([x]) => e >= x);
  return `${10 ** (e - u[0])} ${u[1]}`;
}

export const unitLabel = (u) => u;
