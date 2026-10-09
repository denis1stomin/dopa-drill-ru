// Russian edition: wording helpers, school notation and the "уголок" long division.
import test from 'node:test';
import assert from 'node:assert/strict';
import { plural, pl, date } from '../app/js/ru.js';
import { makeRng, makeProblem, generate, _internal } from '../app/js/problems.js';
import { SKILLS } from '../app/js/skills.js';

test('plural forms follow the 1 / 2-4 / 5+ rule, with 11-14 as "many"', () => {
  const f = (n) => plural(n, 'пример', 'примера', 'примеров');
  assert.deepEqual([1, 2, 4, 5, 11, 12, 14, 21, 22, 25, 101, 111].map(f),
    ['пример', 'примера', 'примера', 'примеров', 'примеров', 'примеров', 'примеров', 'пример', 'примера', 'примеров', 'пример', 'примеров']);
  assert.equal(pl(0, 'день', 'дня', 'дней'), '0 дней');
  assert.equal(date(3, 8), '8 марта');
});

test('long division uses the Russian corner: divisor right of the dividend, quotient under it', () => {
  const p = generate('div3', makeRng(1), { kind: 'div', a: 756, b: 4 });
  assert.equal(p.text, '756 : 4');
  assert.equal(p.answer, '189');
  const at = (id) => p.cells.find((c) => c.id === id);
  // Dividend on row 0 from column 1 (column 0 holds the minus signs).
  assert.deepEqual(['D1', 'D2', 'D3'].map((id) => [at(id).r, at(id).c]), [[0, 1], [0, 2], [0, 3]]);
  // Divisor right after the dividend, quotient digits under it, left to right.
  assert.deepEqual([at('dv0').r, at('dv0').c], [0, 4]);
  assert.deepEqual(['q0', 'q1', 'q2'].map((id) => [at(id).r, at(id).c, at(id).text]), [[1, 4, '1'], [1, 5, '8'], [1, 6, '9']]);
  assert.deepEqual(p.bracket, { r: 0, c0: 4, c1: 6, corner: true });
  // Every partial product gets a minus sign just left of it, revealed with it.
  const minus = p.cells.filter((c) => c.minus);
  assert.equal(minus.length, 3);
  for (const m of minus) {
    const prod = p.cells.filter((c) => c.r === m.r && c.id.startsWith('m') && !c.minus);
    assert.equal(m.c, Math.min(...prod.map((c) => c.c)) - 1);
    assert.ok(p.steps.some((s) => s.after.includes(m.id)));
  }
  // Typing order is the same as before: quotient digit, remainder, next quotient digit.
  assert.deepEqual(p.steps.map((s) => s.digit), ['1', '3', '8', '3', '9']);
});

test('remainders, decimals and mixed numbers use Russian school notation', () => {
  const { GEN } = _internal;
  const rng = makeRng(7);
  const rem = GEN.divRem(rng);
  assert.match(rem.text, /^\d+ : \d$/);
  assert.match(rem.answer, /^\d \(ост\. \d\)$/);
  const dec = GEN.decDivInt(rng);
  assert.match(dec.text, /^\d+,\d : \d$/);
  assert.ok(dec.cells.every((c) => c.text !== '.'));
  const mixed = makeProblem('g4-frac-mixed', makeRng(3));
  assert.match(mixed.text, /^\d \d+\/\d+ [+−] (\d )?\d+\/\d+$/);
});

test('no Japanese text is left in skills or generated problems', () => {
  const jp = /[぀-ヿ一-鿿＀-￯]/;
  const rng = makeRng(11);
  for (const s of SKILLS) {
    assert.doesNotMatch(s.name, jp, s.id);
    for (let i = 0; i < 20; i++) {
      const p = makeProblem(s.id, rng);
      for (const t of [p.title, p.text, p.answerText, ...p.steps.flatMap((st) => [st.label, st.hint || '', st.help ? st.help.text : '']), ...p.cells.map((c) => c.text)]) {
        assert.doesNotMatch(String(t), jp, `${s.id}: ${t}`);
      }
    }
  }
});
