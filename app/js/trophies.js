// Trophies (id036): many small achievements, like the ones in mobile games.
// Each series is one measure with rising steps; every step is a trophy.
// Days and streaks get dense steps; volume series get wide ones so long
// sessions are not pushed too hard (docs/SPEC.md 14.7). Nothing is
// random, conditions are always shown (except a few secrets), and a trophy,
// once earned, is kept.
import { SKILLS, LANES } from './skills.js';
import { isUnlocked, isMastered, starsOf } from './session.js';
import { n as pn } from './ru.js';

export const CATS = ['Постоянство', 'Количество', 'Навыки', 'Рост', 'Экстра', 'Комбо', 'Точность', 'Допа', 'Ошибки', 'Классы', 'Коллекция', 'Секреты'];

const fmt = (n) => n.toLocaleString('ru-RU');
const DOPA_LABEL = { 2: '100', 3: '1000', 4: '10 тыс.', 5: '100 тыс.', 6: '1 млн', 7: '10 млн', 8: '100 млн', 9: '1 млрд' };
const RANKS = ['bronze', 'silver', 'gold', 'rainbow'];
export const RANK_NAME = { bronze: 'бронза', silver: 'серебро', gold: 'золото', rainbow: 'радуга', secret: 'секрет' };

// Rank by position in its series: first ~30% bronze, then silver, gold, and the last step rainbow.
function rankAt(i, n) {
  if (n === 1) return 'gold';
  if (i === n - 1) return 'rainbow';
  return RANKS[Math.min(2, Math.floor((i / (n - 1)) * 3.3))];
}

// A series: { key, cat, title, metric, steps, name(v), desc(v) } or explicit items.
const SERIES_DEFS = [
  { key: 'streak', cat: 'Постоянство', title: 'Дни подряд', metric: 'bestStreak', steps: [3, 5, 7, 10, 14, 21, 30, 50, 75, 100, 150, 200, 365], name: (v) => `${pn(v, 'day')} подряд`, desc: (v) => `Играть ${pn(v, 'day')} подряд` },
  { key: 'days', cat: 'Постоянство', title: 'Дни с игрой', metric: 'days', steps: [1, 3, 5, 7, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 300, 365, 500, 730, 1000], name: (v) => `${pn(v, 'day')} с игрой`, desc: (v) => `Играть в общей сложности ${pn(v, 'day')}` },
  { key: 'stickers', cat: 'Постоянство', title: 'Наклейки', metric: 'stickers', steps: [1, 7, 14, 30, 50, 100, 200, 365], name: (v) => pn(v, 'sticker'), desc: (v) => `Собрать ${pn(v, 'stickerAcc')} за ежедневный вход` },
  { key: 'crowns', cat: 'Постоянство', title: 'Наклейки-короны', metric: 'crowns', steps: [1, 3, 5, 10, 20, 52], name: (v) => pn(v, 'crown'), desc: (v) => `Собрать ${pn(v, 'crownAcc')} — наклейки 7-го дня` },
  { key: 'problems', cat: 'Количество', title: 'Решённые примеры', metric: 'problems', steps: [10, 30, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 20000, 30000, 50000, 100000], name: (v) => pn(v, 'problem'), desc: (v) => `Решить в общей сложности ${pn(v, 'problem')}` },
  { key: 'cells', cat: 'Количество', title: 'Введённые цифры', metric: 'cells', steps: [100, 500, 1000, 3000, 5000, 10000, 30000, 50000, 100000, 300000], name: (v) => pn(v, 'digitAcc'), desc: (v) => `Ввести правильно ${pn(v, 'digitAcc')}` },
  { key: 'plays', cat: 'Количество', title: 'Сыгранные игры', metric: 'plays', steps: [1, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000], name: (v) => pn(v, 'game'), desc: (v) => `Пройти игру до конца ${pn(v, 'time')}` },
  { key: 'minutes', cat: 'Количество', title: 'Время в игре', metric: 'minutes', steps: [10, 30, 60, 120, 300, 600, 1200, 3000], name: (v) => (v >= 60 ? `${pn(v / 60, 'hour')} в игре` : `${pn(v, 'minute')} в игре`), desc: (v) => `Играть в общей сложности ${v >= 60 ? pn(v / 60, 'hour') : pn(v, 'minute')}` },
  { key: 'unlocked', cat: 'Навыки', title: 'Открытые навыки', metric: 'unlocked', steps: [3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 58], name: (v) => `Открыто: ${v}`, desc: (v) => `Открыть ${pn(v, 'skill')}` },
  { key: 'mastered', cat: 'Навыки', title: 'Освоенные навыки', metric: 'mastered', steps: [1, 3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 58], name: (v) => `Освоено: ${v}`, desc: (v) => `Освоить ${pn(v, 'skill')}` },
  { key: 'gradeDone', cat: 'Навыки', title: 'Весь класс освоен', items: [1, 2, 3, 4, 5, 6].map((g) => ({ id: `gradeDone-${g}`, metric: `gradeDone${g}`, need: 1, name: `${g} класс освоен`, desc: `Освоить все навыки ${g} класса` })) },
  { key: 'laneDone', cat: 'Навыки', title: 'Вся ветка освоена', items: LANES.map((l, i) => ({ id: `laneDone-${i}`, metric: `laneDone${i}`, need: 1, name: `${l}: всё освоено`, desc: `Освоить все навыки ветки «${l}»` })) },
  { key: 'extras', cat: 'Экстра', title: 'Выход в экстру', metric: 'extras', steps: [1, 3, 5, 10, 20, 30, 50, 100, 200, 300], name: (v) => `Экстра: ${pn(v, 'time')}`, desc: (v) => `Выйти в экстру ${pn(v, 'time')}` },
  { key: 'extraBest', cat: 'Экстра', title: 'Рекорд экстры', metric: 'extraBest', steps: [3, 5, 7, 10, 12, 15, 18, 20, 23, 25, 30], name: (v) => `${pn(v, 'problem')} за раз`, desc: (v) => `Решить ${pn(v, 'problem')} в одной экстре` },
  { key: 'extraSolved', cat: 'Экстра', title: 'Решено в экстре', metric: 'extraSolved', steps: [10, 30, 50, 100, 200, 300, 500, 1000, 2000, 3000], name: (v) => `Экстра: ${pn(v, 'problem')}`, desc: (v) => `Решить в экстрах ${pn(v, 'problem')}` },
  { key: 'combo', cat: 'Комбо', title: 'Комбо', metric: 'maxCombo', steps: [5, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 300], name: (v) => `Комбо ${v}`, desc: (v) => `Сделать комбо ${v}` },
  { key: 'perfects', cat: 'Точность', title: 'Без ошибок', metric: 'perfects', steps: [1, 3, 5, 10, 20, 30, 50, 100, 200, 300], name: (v) => `Без ошибок: ${pn(v, 'time')}`, desc: (v) => `Решить всё с первого раза за игру — ${pn(v, 'time')}` },
  { key: 'firstTry', cat: 'Точность', title: 'С первого раза', metric: 'firstTry', steps: [10, 50, 100, 300, 500, 1000, 3000, 5000, 10000, 30000], name: (v) => `С первого раза: ${fmt(v)}`, desc: (v) => `Решить с первого раза ${pn(v, 'problem')}` },
  { key: 'dopa', cat: 'Допа', title: 'Допа', metric: 'bestDopaL', steps: [2, 3, 4, 5, 6, 7, 8, 9], name: (v) => `Допа ${DOPA_LABEL[v]}`, desc: (v) => `Набрать за одну игру допу больше ${DOPA_LABEL[v]}` },
  { key: 'review', cat: 'Ошибки', title: 'Работа над ошибками', metric: 'reviewSolved', steps: [1, 5, 10, 30, 50, 100, 200, 300], name: (v) => `Исправлено: ${v}`, desc: (v) => `Исправить ${pn(v, 'mistakeAcc')}` },
  ...[1, 2, 3, 4, 5, 6].map((g) => ({ key: `grade${g}`, cat: 'Классы', title: `Играть за ${g} класс`, metric: `gradePlays${g}`, steps: [1, 10, 30], name: (v) => `${g} класс: ${pn(v, 'time')}`, desc: (v) => `Сыграть «${g} класс» ${pn(v, 'time')}` })),
  { key: 'secret', cat: 'Секреты', title: 'Секреты', items: [
    { id: 'secret-perfect14', metric: 'flag:perfect14', need: 1, name: '14 без единой ошибки', desc: 'Решить 14 примеров ни разу не ошибившись', secret: true },
    { id: 'secret-extraClean', metric: 'flag:extraClean', need: 1, name: 'Чистая экстра', desc: 'Решить в экстре 5 и больше примеров без ошибок', secret: true },
    { id: 'secret-sunday', metric: 'flag:sunday', need: 1, name: 'Воскресная математика', desc: 'Поиграть в воскресенье', secret: true },
    { id: 'secret-newyear', metric: 'flag:newyear', need: 1, name: 'Новогодний тренажёр', desc: 'Поиграть 1 января', secret: true },
    { id: 'secret-comeback', metric: 'flag:comeback', need: 1, name: 'С возвращением!', desc: 'Вернуться к игре после перерыва в неделю или больше', secret: true },
    { id: 'secret-allmodes', metric: 'allModes', need: 1, name: 'Все режимы', desc: 'Сыграть «Мой уровень», за класс, тренировку и работу над ошибками', secret: true },
  ] },
];

// Other features add their own series (id045). Keep this list append-only.
export const SERIES = [];
export const TROPHIES = [];
export const TROPHY = {};
export function addSeries(def) {
  const items = def.items
    ? def.items.map((it, i, a) => ({ rank: it.secret ? 'secret' : rankAt(i, a.length), ...it }))
    : def.steps.map((v, i, a) => ({ id: `${def.key}-${v}`, metric: def.metric, need: v, name: def.name(v), desc: def.desc(v), rank: rankAt(i, a.length) }));
  const series = { key: def.key, cat: def.cat, title: def.title, items: items.map((it) => ({ ...it, series: def.key, cat: def.cat, reward: it.reward || null })) };
  SERIES.push(series);
  for (const it of series.items) { TROPHIES.push(it); TROPHY[it.id] = it; }
  return series;
}
SERIES_DEFS.forEach(addSeries);

// id045: the features added after id036 (stars, quests, hammer, rust,
// time capsule, "Стало лучше!", collection).
[
  { key: 'questDays', cat: 'Постоянство', title: 'Все задания дня', metric: 'questDays', steps: [1, 3, 7, 14, 30, 50, 100, 200, 365], name: (v) => `${pn(v, 'day')} со всеми заданиями`, desc: (v) => `Выполнить все задания дня — ${pn(v, 'day')}` },
  { key: 'questRun', cat: 'Постоянство', title: 'Задания подряд', metric: 'questRun', steps: [2, 3, 5, 7, 14, 30], name: (v) => `Задания ${pn(v, 'day')} подряд`, desc: (v) => `Выполнять все задания ${pn(v, 'day')} подряд` },
  { key: 'hammer', cat: 'Постоянство', title: 'Молоток «Не в счёт»', metric: 'hammerUsed', steps: [1, 3, 10], name: (v) => (v === 1 ? 'Первый «не в счёт»' : `Молоток: ${pn(v, 'time')}`), desc: (v) => `Стукнуть молотком «Не в счёт» ${pn(v, 'time')}` },
  { key: 'starsTotal', cat: 'Навыки', title: 'Звёзды', metric: 'starsTotal', steps: [5, 10, 25, 50, 75, 100, 150, 200, 250, 290], name: (v) => pn(v, 'star'), desc: (v) => `Собрать у навыков ${pn(v, 'starAcc')}` },
  { key: 'star5', cat: 'Навыки', title: 'Навыки на ☆5', metric: 'star5', steps: [1, 3, 5, 10, 20, 30, 58], name: (v) => `☆5: ${v}`, desc: (v) => `Довести до ☆5 ${pn(v, 'skill')}` },
  { key: 'gradeStar3', cat: 'Навыки', title: 'Весь класс на ☆3', items: [1, 2, 3, 4, 5, 6].map((g) => ({ id: `gradeStar3-${g}`, metric: `gradeStar3${g}`, need: 1, name: `${g} класс на ☆3`, desc: `Довести все навыки ${g} класса до ☆3 и выше` })) },
  { key: 'polished', cat: 'Рост', title: 'Чистка ржавчины', metric: 'polished', steps: [1, 3, 5, 10, 30, 50], name: (v) => `Блеск: ${pn(v, 'time')}`, desc: (v) => `Почистить заржавевший навык ${pn(v, 'time')}` },
  { key: 'capsules', cat: 'Рост', title: 'Капсула времени', metric: 'capsules', steps: [1, 3, 5, 10, 30], name: (v) => pn(v, 'capsule'), desc: (v) => `Открыть ${pn(v, 'capsuleAcc')} времени` },
  { key: 'capsuleFaster', cat: 'Рост', title: 'Быстрее, чем тогда', metric: 'capsuleFaster', steps: [1, 5, 10], name: (v) => `Быстрее: ${pn(v, 'time')}`, desc: (v) => `Решить пример из капсулы быстрее, чем тогда (${pn(v, 'time')})` },
  { key: 'grew', cat: 'Рост', title: 'Стало лучше!', metric: 'grew', steps: [1, 5, 10, 30, 50, 100], name: (v) => `Лучше: ${pn(v, 'time')}`, desc: (v) => `Увидеть в итогах «Стало лучше!» ${pn(v, 'time')}` },
  { key: 'items', cat: 'Коллекция', title: 'Коллекция', metric: 'itemsOwned', steps: [10, 20, 30, 40, 47], name: (v) => `Коллекция: ${v}`, desc: (v) => `Собрать ${pn(v, 'item')} коллекции` },
  { key: 'catComplete', cat: 'Коллекция', title: 'Полные наборы', metric: 'catComplete', steps: [1, 3, 5, 8], name: (v) => `Полных наборов: ${v}`, desc: (v) => `Собрать целиком ${pn(v, 'set')} коллекции` },
].forEach(addSeries);

// Numbers every trophy is measured against, from the saved state.
// snap: { stats, prog, bestStreak, stickers, crowns, ...extra metrics }
export function trophyMetrics(snap) {
  const s = snap.stats || {};
  const prog = snap.prog || { skills: {} };
  const m = {
    bestStreak: snap.bestStreak || 0, days: s.days || 0, stickers: snap.stickers || 0, crowns: snap.crowns || 0,
    problems: s.problems || 0, cells: s.cells || 0, plays: s.plays || 0, minutes: Math.floor((s.playMs || 0) / 60000),
    unlocked: SKILLS.filter((x) => isUnlocked(prog, x.id)).length, mastered: SKILLS.filter((x) => isMastered(prog, x.id)).length,
    extras: s.extras || 0, extraBest: s.extraBest || 0, extraSolved: s.extraSolved || 0, maxCombo: s.maxCombo || 0,
    perfects: s.perfects || 0, firstTry: s.firstTry || 0, bestDopaL: Math.floor((s.bestDopaL || 0) + 1e-9), reviewSolved: s.reviewSolved || 0,
  };
  const stars = Object.fromEntries(SKILLS.map((x) => [x.id, starsOf(prog, x.id)]));
  m.starsTotal = Object.values(stars).reduce((a, b) => a + b, 0);
  m.star5 = Object.values(stars).filter((n) => n >= 5).length;
  m.polished = s.polished || 0; m.capsules = s.capsules || 0; m.capsuleFaster = s.capsuleFaster || 0; m.grew = s.grew || 0;
  for (let g = 1; g <= 6; g++) {
    m[`gradeStar3${g}`] = SKILLS.filter((x) => x.grade === g).every((x) => stars[x.id] >= 3) ? 1 : 0;
    m[`gradeDone${g}`] = SKILLS.filter((x) => x.grade === g).every((x) => isMastered(prog, x.id)) ? 1 : 0;
    m[`gradePlays${g}`] = (s.grades || {})[g] || 0;
  }
  LANES.forEach((_, i) => { m[`laneDone${i}`] = SKILLS.filter((x) => x.lane === i).every((x) => isMastered(prog, x.id)) ? 1 : 0; });
  for (const [k, v] of Object.entries(s.flags || {})) if (v) m[`flag:${k}`] = 1;
  const modes = s.modes || {};
  m.allModes = ['level', 'grade', 'practice', 'review'].every((k) => modes[k]) ? 1 : 0;
  Object.assign(m, snap.extra || {});
  return m;
}
export const valueOf = (m, metric) => m[metric] || 0;

// Earn every trophy whose condition is met. Returns the new ones (in list order).
// `state` is the saved { got: { id: time } }; the first call earns what the
// existing records already reach and marks them as a batch.
export function evaluate(state, metrics, at = Date.now()) {
  state.got = state.got || {};
  const fresh = [];
  for (const t of TROPHIES) {
    if (state.got[t.id]) continue;
    if (valueOf(metrics, t.metric) >= t.need) { state.got[t.id] = at; fresh.push(t); }
  }
  if (!state.init) { state.init = true; state.batch = fresh.map((t) => t.id); return []; }
  return fresh;
}

export const earnedCount = (state) => TROPHIES.filter((t) => state.got && state.got[t.id]).length;

// Progress of one series for the list screen.
export function seriesView(series, state, metrics) {
  const got = series.items.filter((t) => state.got && state.got[t.id]);
  const next = series.items.find((t) => !(state.got && state.got[t.id]));
  const top = got[got.length - 1] || null;
  return { series, got, next, top, value: next ? valueOf(metrics, next.metric) : null };
}
