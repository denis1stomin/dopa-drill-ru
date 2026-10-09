// Russian wording helpers: plural forms, numbers and dates.

// plural(5, 'пример', 'примера', 'примеров') -> 'примеров'
export function plural(n, one, few, many) {
  const a = Math.abs(Math.trunc(n)) % 100; const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  if (b >= 2 && b <= 4) return few;
  return many;
}

// Grouped digits, as written in Russia: 12 345.
export const fmtNum = (n) => n.toLocaleString('ru-RU');

// "5 примеров", "21 день"
export const pl = (n, one, few, many) => `${fmtNum(n)} ${plural(n, one, few, many)}`;

// Words counted most often on screen. "...Acc" are the accusative forms that
// differ for feminine nouns ("собрать 1 наклейку").
export const W = {
  problem: ['пример', 'примера', 'примеров'],
  time: ['раз', 'раза', 'раз'],
  day: ['день', 'дня', 'дней'],
  skill: ['навык', 'навыка', 'навыков'],
  game: ['игра', 'игры', 'игр'],
  star: ['звезда', 'звезды', 'звёзд'],
  starAcc: ['звезду', 'звезды', 'звёзд'],
  sticker: ['наклейка', 'наклейки', 'наклеек'],
  stickerAcc: ['наклейку', 'наклейки', 'наклеек'],
  crown: ['корона', 'короны', 'корон'],
  crownAcc: ['корону', 'короны', 'корон'],
  capsule: ['капсула', 'капсулы', 'капсул'],
  capsuleAcc: ['капсулу', 'капсулы', 'капсул'],
  mistakeAcc: ['ошибку', 'ошибки', 'ошибок'],
  digitAcc: ['цифру', 'цифры', 'цифр'],
  item: ['предмет', 'предмета', 'предметов'],
  set: ['набор', 'набора', 'наборов'],
  minute: ['минута', 'минуты', 'минут'],
  hour: ['час', 'часа', 'часов'],
};
export const n = (count, word) => pl(count, ...W[word]);

export const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
// 1-based month: date(3, 8) -> "8 марта"
export const date = (m, d) => `${d} ${MONTHS_GEN[m - 1]}`;
