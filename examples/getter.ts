// yarn ts-node examples/getter.ts
import safe from '../index';
import * as assert from 'assert';

interface A {
  a?: { b?: string };
}
const o: A = { a: { b: 'x' } };
assert(safe(o).a.b.$ === 'x');
