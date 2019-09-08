// yarn ts-node examples/unions.ts
import safe from '../index';
import * as assert from 'assert';

type A = { a: number } | { b: string };
const o: A = { a: 1 };
assert(safe(o).a.$ === 1);
