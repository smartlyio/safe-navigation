// yarn ts-node examples/pmap.ts
import safe from '../index';
import * as assert from 'assert';

interface A {
  a?: { b?: string };
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async function () {
  const o: A = { a: { b: 'x' } };
  const result = await safe(o).a.b.$pmap(async value => 'got ' + value);
  assert(safe(o).a.b.$ === 'x');
  assert(safe(result).a.b.$ === 'got x');
})();
