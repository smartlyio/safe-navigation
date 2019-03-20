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

Returns a new object with the target mapped using a promise returning map function

```js
>>examples/pmap.ts
```



