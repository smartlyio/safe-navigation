# safe-navigation

type and null safe navigation in json objects

## get `.$`

Returns the value or undefined if any value on the path to it is undefined

```js
import safe from '../index'
import * as assert from 'assert'

type A = { a?: { b?: string }}
const o: A = { a: { b: 'x'}}
assert(safe(o).a.b.$ === 'x')

```

## map with promises `.$pmap`

Mutates the given object using a async function and returns the mutated object

```js
import safe from '../index'
import * as assert from 'assert'

type A = { a?: { b?: string }}
async function test() {
    const o: A = { a: { b: 'x'}}
    const result = await safe(o).a.b.$pmap(async value => 'got ' + value)
    assert(safe(result).a.b.$ === 'got x');
}
test()

```



