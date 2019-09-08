// yarn ts-node examples/set.ts
import safe from '../index';
import * as assert from 'assert';

interface A {
  a?: { b?: string };
}
const o: A = { a: { b: 'old' } };
const newValue: A = safe(o).a.b.$set('new');
assert(safe(newValue).a.b.$ === 'new');
