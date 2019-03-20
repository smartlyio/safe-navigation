# safe-navigation

type(script) and null safe navigation in json objects 

## get `.$`

Returns the value or undefined if any value on the path to it is undefined

```js
// yarn ts-node examples/getter.ts
import safe from '../index'
import * as assert from 'assert'

type A = { a?: { b?: string }}
const o: A = { a: { b: 'x'}}
assert(safe(o).a.b.$ === 'x')

```

The optional chaining also takes into account union types.

```js
// yarn ts-node examples/unions.ts
import safe from '../index'
import * as assert from 'assert'

type A = { a: number } | { b: string }
const o: A = { a: 1 }
assert(safe(o).a.$ === 1)

```

## map with promises `.$pmap`

Returns a new object with the target mapped using a promise returning map function

```js
// yarn ts-node examples/pmap.ts
import safe from '../index'
import * as assert from 'assert'

type A = { a?: { b?: string }}
async function test() {
    const o: A = { a: { b: 'x'}}
    const result = await safe(o).a.b.$pmap(async value => 'got ' + value)
    assert(safe(o).a.b.$ === 'x');
    assert(safe(result).a.b.$ === 'got x');
}
test()

```



