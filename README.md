<div align="center">
<picture>
  <source srcset="./logo.png" alt="Snar" width="300" height="114"></source>
  <img src="./logo.png" alt="Snar" width="300" height="114">
</picture>

### Reactive Object made simple.

[![Published on npm](https://raster.shields.io/npm/v/snar.png?logo=npm)](https://www.npmjs.com/package/snar)

</div>

**Snar** is a tiny library that helps creating simple yet efficient reactive objects.

```javascript
import {ReactiveObject, state} from 'snar';

class MyObject extends ReactiveObject {
  @state() value;

  updated() {
    // Every time `value` changes,
    // this function is called as a reaction.
    // Do something...
  }
}

const obj = new MyObject();
obj.value = 'foo'; // <- makes the object reacts.
```

## Installation

```
npm i -D snar
```

or

```
yarn add -D snar
```

## Relation with [Lit](https://github.com/lit/lit)

Snar base class `ReactiveObject` was made by pruning `ReactiveElement` base class from `@lit/reactive-element` package of the Lit framework, and only keep the *reactivity* feature.  
This implies:

- You don't need Lit as a dependency to use this library. In fact **Snar has no dependencies**.
- You can use it in both Node and Browser environment.
- If you've used Lit before, you'll feel yourself at home because it shares the same syntax.
