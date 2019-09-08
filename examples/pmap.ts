// yarn ts-node examples/pmap.ts
import safe from '../index';
import * as assert from 'assert';

interface A {
  a?: { b?: string };
}
async function test() {
  const o: A = { a: { b: 'x' } };
  const result = await safe(o).a.b.$pmap(async value => 'got ' + value);
  assert(safe(o).a.b.$ === 'x');
  assert(safe(result).a.b.$ === 'got x');
}
// tslint:disable-next-line:no-floating-promises
test();
