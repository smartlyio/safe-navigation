# safe-navigation

type(script) and null safe navigation in json objects 

## get `.$`

Returns the value or undefined if any value on the path to it is undefined

```js
>>examples/getter.ts
```

The optional chaining also takes into account union types.

```js
>>examples/unions.ts
```

## map with promises `.$pmap`

Mutates the given object using a async function and returns the mutated object

```js
>>examples/pmap.ts
```



