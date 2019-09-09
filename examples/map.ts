// yarn ts-node examples/map.ts
import safe from '../index';
import * as assert from 'assert';

interface A {
  a?: { b?: string };
}
const o: A = { a: { b: 'old' } };
const newValue: A = safe(o).a.b.$map((n: any) => n + ' to new');
assert(safe(newValue).a.b.$ === 'old to new');
