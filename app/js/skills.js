// Skill tree for grades 1-6 (calculation only). See docs/curriculum.md.
// Each skill: id, name (shown on screen), grade, lane (tree column),
// req (all must be mastered to unlock), gen (generator + params, problems.js).
//
// Russian edition: grades follow the Russian school programme (primary school
// grades 1-4, then grades 5-6). Skill ids keep the upstream names, so the
// "gN" prefix is the original Japanese grade, not the grade used here.

export const LANES = ['Плюс и минус', 'Умножение и деление', 'Дроби', 'Разное'];

// Mastery / unlock rule (provisional): 5 first-try clears in the last 6 attempts.
export const MASTERY = { window: 6, need: 5 };

export const SKILLS = [
  // ---------------------------------------------------------------- grade 1
  { id: 'g1-compose10', name: 'Состав числа 10', grade: 1, lane: 0, req: [], gen: ['compose', { total: 10 }] },
  { id: 'g1-add-nc', name: 'Сложение до 10', grade: 1, lane: 0, req: [], gen: ['hadd', { a: [1, 9], b: [1, 9], carry: 'none' }] },
  { id: 'g1-sub-nb', name: 'Вычитание до 10', grade: 1, lane: 0, req: ['g1-add-nc'], gen: ['hsub', { a: [2, 10], b: [1, 9], borrow: 'none' }] },
  { id: 'g1-add-c', name: 'Сложение через десяток', grade: 1, lane: 0, req: ['g1-compose10', 'g1-add-nc'], gen: ['hadd', { a: [2, 9], b: [2, 9], carry: 'yes' }] },
  { id: 'g1-sub-b', name: 'Вычитание через десяток', grade: 1, lane: 0, req: ['g1-add-c', 'g1-sub-nb'], gen: ['hsub', { a: [11, 18], b: [2, 9], borrow: 'yes' }] },
  { id: 'g1-add3', name: 'Три числа', grade: 1, lane: 0, req: ['g1-sub-b'], gen: ['add3', {}] },

  // ---------------------------------------------------------------- grade 2
  { id: 'g1-add-2d1', name: '2-значное + 1-значное', grade: 2, lane: 0, req: ['g1-add-c'], gen: ['hadd', { a: [11, 89], b: [1, 9], carry: 'none', tensToo: true }] },
  { id: 'g1-sub-2d1', name: '2-значное − 1-значное', grade: 2, lane: 0, req: ['g1-sub-b', 'g1-add-2d1'], gen: ['hsub', { a: [11, 99], b: [1, 9], borrow: 'none', tensToo: true }] },
  { id: 'g2-vadd2-nc', name: 'Сложение в столбик', grade: 2, lane: 0, req: ['g1-add-2d1'], gen: ['vadd', { da: 2, db: 2, carry: 'none', maxDigits: 2 }] },
  { id: 'g2-vadd2-c', name: 'Столбик: сложение с переходом', grade: 2, lane: 0, req: ['g2-vadd2-nc', 'g1-add-c'], gen: ['vadd', { da: 2, db: [1, 2], carry: 'some', maxDigits: 2 }] },
  { id: 'g2-vsub2-nb', name: 'Вычитание в столбик', grade: 2, lane: 0, req: ['g1-sub-2d1'], gen: ['vsub', { da: 2, db: 2, borrow: 'none' }] },
  { id: 'g2-vsub2-b', name: 'Столбик: вычитание с переходом', grade: 2, lane: 0, req: ['g2-vsub2-nb', 'g1-sub-b'], gen: ['vsub', { da: 2, db: [1, 2], borrow: 'some' }] },
  { id: 'g2-kuku25', name: 'Умножение на 2 и 3', grade: 2, lane: 1, req: ['g1-add-c'], gen: ['kuku', { dans: [2, 3] }] },

  // ---------------------------------------------------------------- grade 3
  { id: 'g2-vadd3s', name: 'Сумма больше 100', grade: 3, lane: 0, req: ['g2-vadd2-c'], gen: ['vadd', { da: 2, db: 2, carry: 'many', maxDigits: 3 }] },
  { id: 'g2-vsub3s', name: 'Вычитание из 100–199', grade: 3, lane: 0, req: ['g2-vsub2-b', 'g2-vadd3s'], gen: ['vsub', { da: 3, db: 2, borrow: 'some', aMax: 199 }] },
  { id: 'g3-vadd3', name: 'Сложение 3-значных', grade: 3, lane: 0, req: ['g2-vadd3s'], gen: ['vadd', { da: 3, db: 3, carry: 'some', maxDigits: 3 }] },
  { id: 'g3-vsub3', name: 'Вычитание 3-значных', grade: 3, lane: 0, req: ['g2-vsub3s'], gen: ['vsub', { da: 3, db: [2, 3], borrow: 'some' }] },
  { id: 'g2-kuku34', name: 'Умножение на 4 и 5', grade: 3, lane: 1, req: ['g2-kuku25'], gen: ['kuku', { dans: [4, 5] }] },
  { id: 'g2-kuku67', name: 'Умножение на 6 и 7', grade: 3, lane: 1, req: ['g2-kuku34'], gen: ['kuku', { dans: [6, 7] }] },
  { id: 'g2-kuku891', name: 'Умножение на 8, 9 и 1', grade: 3, lane: 1, req: ['g2-kuku67'], gen: ['kuku', { dans: [8, 9, 1] }] },
  { id: 'g2-kuku-mix', name: 'Вся таблица умножения', grade: 3, lane: 1, req: ['g2-kuku891'], gen: ['kuku', { dans: [1, 2, 3, 4, 5, 6, 7, 8, 9] }] },
  { id: 'g3-div-basic', name: 'Табличное деление', grade: 3, lane: 1, req: ['g2-kuku-mix'], gen: ['div', { exact: true }] },
  { id: 'g3-div-rem', name: 'Деление с остатком', grade: 3, lane: 1, req: ['g3-div-basic'], gen: ['divRem', {}] },
  { id: 'g2-mul-tens', name: 'Умножение десятков', grade: 3, lane: 1, req: ['g2-kuku-mix'], gen: ['mulTens', {}] },
  { id: 'g3-div-tens', name: 'Внетабличное деление', grade: 3, lane: 1, req: ['g3-div-basic'], gen: ['divTens', {}] },
  { id: 'g3-vmul-2x1', name: '2-значное × 1-значное', grade: 3, lane: 1, req: ['g2-mul-tens'], gen: ['vmul', { da: 2, db: 1 }] },
  { id: 'g3-vmul-3x1', name: '3-значное × 1-значное', grade: 3, lane: 1, req: ['g3-vmul-2x1'], gen: ['vmul', { da: 3, db: 1 }] },
  { id: 'g2-frac-of', name: 'Доля числа', grade: 3, lane: 2, req: ['g2-kuku25'], gen: ['fracOf', { dens: [2, 3, 4] }] },
  { id: 'g4-order', name: 'Порядок действий', grade: 3, lane: 3, req: ['g2-kuku-mix', 'g2-vsub2-b'], gen: ['order', {}] },

  // ---------------------------------------------------------------- grade 4
  { id: 'g3-vadd4', name: 'Сложение многозначных', grade: 4, lane: 0, req: ['g3-vadd3'], gen: ['vadd', { da: 4, db: [3, 4], carry: 'many', maxDigits: 4 }] },
  { id: 'g3-vsub4', name: 'Вычитание многозначных', grade: 4, lane: 0, req: ['g3-vsub3'], gen: ['vsub', { da: 4, db: [3, 4], borrow: 'zero' }] },
  { id: 'g3-vmul-2x2', name: '2-значное × 2-значное', grade: 4, lane: 1, req: ['g3-vmul-2x1'], gen: ['vmul', { da: 2, db: 2 }] },
  { id: 'g3-vmul-3x2', name: '3-значное × 2-значное', grade: 4, lane: 1, req: ['g3-vmul-2x2', 'g3-vmul-3x1'], gen: ['vmul', { da: 3, db: 2 }] },
  { id: 'g4-vdiv-2d1', name: 'Уголком: 2-значное : 1-значное', grade: 4, lane: 1, req: ['g3-div-rem', 'g3-div-tens'], gen: ['vdiv', { dd: 2, ds: 1 }] },
  { id: 'g4-vdiv-3d1', name: 'Уголком: 3-значное : 1-значное', grade: 4, lane: 1, req: ['g4-vdiv-2d1'], gen: ['vdiv', { dd: 3, ds: 1 }] },
  { id: 'g4-vdiv-2d2', name: 'Уголком: 2-значное : 2-значное', grade: 4, lane: 1, req: ['g4-vdiv-2d1', 'g3-vmul-2x1'], gen: ['vdiv', { dd: 2, ds: 2 }] },
  { id: 'g4-vdiv-3d2', name: 'Уголком: 3-значное : 2-значное', grade: 4, lane: 1, req: ['g4-vdiv-2d2', 'g4-vdiv-3d1'], gen: ['vdiv', { dd: 3, ds: 2 }] },
  { id: 'g6-letter', name: 'Уравнения', grade: 4, lane: 3, req: ['g4-order'], gen: ['letter', {}] },

  // ---------------------------------------------------------------- grade 5
  { id: 'g4-round', name: 'Округление', grade: 5, lane: 3, req: ['g3-vadd4'], gen: ['round', {}] },
  { id: 'g3-frac-same', name: 'Одинаковые знаменатели', grade: 5, lane: 2, req: ['g2-frac-of'], gen: ['frac', { op: 'addsub', same: true, maxOne: true }] },
  { id: 'g4-frac-mixed', name: 'Смешанные числа', grade: 5, lane: 2, req: ['g3-frac-same'], gen: ['frac', { op: 'addsub', same: true, mixed: true }] },
  { id: 'g3-dec-add1', name: 'Сложение десятичных', grade: 5, lane: 2, req: ['g2-vadd2-c'], gen: ['vdec', { op: 'add', places: 1 }] },
  { id: 'g3-dec-sub1', name: 'Вычитание десятичных', grade: 5, lane: 2, req: ['g3-dec-add1', 'g2-vsub2-b'], gen: ['vdec', { op: 'sub', places: 1 }] },
  { id: 'g4-dec-add2', name: 'Десятичные дроби: сотые', grade: 5, lane: 2, req: ['g3-dec-sub1'], gen: ['vdec', { op: 'addsub', places: 2 }] },
  { id: 'g4-dec-mul', name: 'Десятичная дробь × число', grade: 5, lane: 2, req: ['g4-dec-add2', 'g3-vmul-2x1'], gen: ['vmul', { da: 2, db: 1, pa: 1 }] },
  { id: 'g4-dec-div', name: 'Десятичная дробь : число', grade: 5, lane: 2, req: ['g4-dec-mul', 'g4-vdiv-2d1'], gen: ['decDivInt', {}] },
  { id: 'g5-dec-mul', name: 'Умножение десятичных', grade: 5, lane: 2, req: ['g4-dec-mul'], gen: ['vmul', { da: 2, db: 2, pa: 1, pb: 1 }] },
  { id: 'g5-dec-div', name: 'Деление на десятичную', grade: 5, lane: 2, req: ['g4-dec-div', 'g5-dec-mul'], gen: ['decDivDec', {}] },
  { id: 'g5-percent', name: 'Проценты', grade: 5, lane: 3, req: ['g4-dec-mul'], gen: ['percent', {}] },

  // ---------------------------------------------------------------- grade 6
  { id: 'g5-gcd', name: 'НОД', grade: 6, lane: 3, req: ['g3-div-basic'], gen: ['gcdlcm', { kind: 'gcd' }] },
  { id: 'g5-lcm', name: 'НОК', grade: 6, lane: 3, req: ['g5-gcd'], gen: ['gcdlcm', { kind: 'lcm' }] },
  { id: 'g5-frac-reduce', name: 'Сокращение дробей', grade: 6, lane: 2, req: ['g5-gcd', 'g4-frac-mixed'], gen: ['frac', { op: 'reduce' }] },
  { id: 'g5-frac-diff', name: 'Разные знаменатели', grade: 6, lane: 2, req: ['g5-frac-reduce', 'g5-lcm'], gen: ['frac', { op: 'addsub', same: false }] },
  { id: 'g5-frac-int', name: 'Дробь × и : число', grade: 6, lane: 2, req: ['g5-frac-reduce'], gen: ['frac', { op: 'muldivInt' }] },
  { id: 'g6-frac-mul', name: 'Умножение дробей', grade: 6, lane: 2, req: ['g5-frac-int'], gen: ['frac', { op: 'mul' }] },
  { id: 'g6-frac-div', name: 'Деление дробей', grade: 6, lane: 2, req: ['g6-frac-mul'], gen: ['frac', { op: 'div' }] },
  { id: 'g6-frac-dec', name: 'Десятичные и обыкновенные', grade: 6, lane: 2, req: ['g6-frac-div', 'g5-dec-div'], gen: ['frac', { op: 'decimal' }] },
  { id: 'g6-ratio', name: 'Пропорции', grade: 6, lane: 3, req: ['g5-lcm'], gen: ['ratio', {}] },
];

export const SKILL = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

// Depth in the tree = longest prerequisite chain (roots are 0).
export const DEPTH = (() => {
  const memo = {};
  const d = (id) => memo[id] ?? (memo[id] = SKILL[id].req.length ? 1 + Math.max(...SKILL[id].req.map(d)) : 0);
  for (const s of SKILLS) d(s.id);
  return memo;
})();

export const skillsOfGrade = (g) => SKILLS.filter((s) => s.grade === g);
