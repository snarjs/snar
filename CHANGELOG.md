# Change Log

## 2.2.0

### Patches

- [lib/localstorage] removed reflection system in favor of manual replacement.

## 2.1.5

### Patches

- Provides `toJSON` and `fromObject` as helpers to respectively and conveniently convert object <-> instance.

## 2.1.3

### Patches

- Fix `ReactiveLocalStorage` doesn't update twice on initialization.

## 2.1.2

### Minor Changes

- Add `__firstUpdated` for tool authors to hide logic.
- Add `getLocalStatePropertyNames` to `ReactiveObject` to access user-defined local properties.
- Add `getLineageStatePropertyNames` to `ReactiveObject` to access user-defined lineage properties (inheritance tree).
- Using `getLocalStatePropertyNames` in `ReactiveLocalStorage`.

## 2.1.1

### Patches

- Define `localElementPropertyNames` in `localstorage.js` to make sure we work with local properties.

## 2.1.0

### Minor Changes

- Add `localstorage.js` utility to the lib.
