// Cobre falhas de armazenamento que não aparecem no fluxo normal do navegador.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
const code = readFileSync(new URL('../assets/js/main.js', import.meta.url), 'utf8');
for (const scenario of ['empty', 'light', 'invalid', 'blocked']) {
  const events = {};
  const root = { dataset: {}, classList: { remove() {} } };
  const button = { setAttribute() {}, addEventListener(type, fn) { events[type] = fn; } };
  const meta = { setAttribute() {} };
  const document = {
    documentElement: root,
    querySelector(selector) { return selector === '.theme-toggle' ? button : selector === 'meta[name="theme-color"]' ? meta : null; },
    querySelectorAll() { return []; },
    addEventListener() {}
  };
  const storage = {
    getItem() { return scenario === 'light' ? 'light' : scenario === 'invalid' ? 'other' : null; },
    setItem() { if (scenario === 'blocked') throw new Error('storage blocked'); }
  };
  const window = { location: { hash: '' }, addEventListener() {} };
  Object.defineProperty(window, 'localStorage', { get() { if (scenario === 'blocked') throw new Error('storage blocked'); return storage; } });
  runInNewContext(code, { document, window, HTMLDetailsElement: class {} });
  const expected = scenario === 'light' ? 'light' : 'dark';
  assert.equal(root.dataset.theme, expected, scenario);
  events.click();
  assert.equal(root.dataset.theme, expected === 'dark' ? 'light' : 'dark', scenario);
  events.click();
  assert.equal(root.dataset.theme, expected, scenario);
}
console.log('PASS: default, persisted, invalid and blocked theme storage; no IntersectionObserver.');
