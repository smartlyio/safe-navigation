import safe from '../index'
import * as assert from 'assert'

type A = { a?: { b?: string }}
const o: A = { a: { b: 'x'}}
assert(safe(o).a.b.$ === 'x')
