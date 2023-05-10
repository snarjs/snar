import type {
  HasChanged,
  PropertyDeclaration,
  PropertyDeclarationMap,
  PropertyValues,
} from './types.js';

export type * from './types.js';

export const notEqual: HasChanged = (value, old) => {
  return old !== value && (old === old || value === value);
};

const defaultPropertyDeclaration: PropertyDeclaration = {
  hasChanged: notEqual,
};

export class ReactiveObject extends Object {
  static elementProperties: PropertyDeclarationMap = new Map();

  static createProperty(
    name: PropertyKey,
    options: PropertyDeclaration = defaultPropertyDeclaration
  ) {
    this.elementProperties.set(name, options);
    if (!this.prototype.hasOwnProperty(name)) {
      const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
      const descriptor = this.getPropertyDescriptor(name, key, options);
      if (descriptor !== undefined) {
        Object.defineProperty(this.prototype, name, descriptor);
      }
    }
  }

  protected static getPropertyDescriptor(
    name: PropertyKey,
    key: string | symbol,
    options: PropertyDeclaration
  ): PropertyDescriptor | undefined {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get(): any {
        return (this as {[key: string]: unknown})[key as string];
      },
      set(this: ReactiveObject, value: unknown) {
        const oldValue = (this as {} as {[key: string]: unknown})[
          name as string
        ];
        (this as {} as {[key: string]: unknown})[key as string] = value;
        (this as unknown as ReactiveObject).requestUpdate(
          name,
          oldValue,
          options
        );
      },
      configurable: true,
      enumerable: true,
    };
  }

  static getPropertyOptions(name: PropertyKey) {
    return this.elementProperties.get(name) || defaultPropertyDeclaration;
  }

  private __updatePromise!: Promise<boolean>;

  isUpdatePending = false;

  hasUpdated = false;

  private _$changedProperties!: PropertyValues;

  constructor() {
    super();
    this._initialize();
  }

  _initialize() {
    this.__updatePromise = Promise.resolve(true);
    this._$changedProperties = new Map();

    // this.requestUpdate();
  }

  requestUpdate(
    name?: PropertyKey,
    oldValue?: unknown,
    options?: PropertyDeclaration
  ) {
    let shouldRequestUpdate = true;
    if (name !== undefined) {
      options =
        options ||
        (this.constructor as typeof ReactiveObject).getPropertyOptions(name);
      const hasChanged = options.hasChanged || notEqual;
      if (hasChanged(this[name as keyof this], oldValue)) {
        if (!this._$changedProperties.has(name)) {
          this._$changedProperties.set(name, oldValue);
        }
      } else {
        shouldRequestUpdate = false;
      }
    }
    if (!this.isUpdatePending && shouldRequestUpdate) {
      this.__updatePromise = this.__enqueueUpdate();
    }
  }

  async __enqueueUpdate() {
    this.isUpdatePending = true;
    try {
      await this.__updatePromise;
    } catch (e) {
      Promise.reject(e);
    }
    const result = this.scheduleUpdate();
    if (result != null) {
      await result;
    }
    return !this.isUpdatePending;
  }

  protected scheduleUpdate(): void | Promise<unknown> {
    return this.performUpdate();
  }

  protected performUpdate(): void | Promise<unknown> {
    if (!this.isUpdatePending) {
      return;
    }
    let shouldUpdate = false;
    const changedProperties = this._$changedProperties;
    try {
      shouldUpdate = this.shouldUpdate(changedProperties);
      if (shouldUpdate) {
        this.willUpdate(changedProperties);
        this.__update(changedProperties);
        this.update(changedProperties);
      }
      this.__markUpdated();
    } catch (e) {
      shouldUpdate = false;
      this.__markUpdated();
      throw e;
    }
    if (shouldUpdate) {
      this._$didUpdate(changedProperties);
    }
  }

  protected willUpdate(_changedProperties: PropertyValues): void {}

  _$didUpdate(changedProperties: PropertyValues) {
    if (!this.hasUpdated) {
      this.hasUpdated = true;
      this.__firstUpdated(changedProperties);
      this.firstUpdated(changedProperties);
    }
    this.updated(changedProperties);
  }

  private __markUpdated() {
    this._$changedProperties = new Map();
    this.isUpdatePending = false;
  }

  get updateComplete(): Promise<boolean> {
    return this.getUpdateComplete();
  }

  protected getUpdateComplete(): Promise<boolean> {
    return this.__updatePromise;
  }

  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return true;
  }

  /**
   * Used by extensions if they want to run some code before update().
   * This allows users to write code in update() without the
   * need to use super.update().
   */
  protected __update(_changedProperties: PropertyValues) {}

  protected update(_changedProperties: PropertyValues) {}

  protected updated(_changedProperties: PropertyValues) {}

  protected __firstUpdated(_changedProperties: PropertyValues) {}

  protected firstUpdated(_changedProperties: PropertyValues) {}

  getLocalStatePropertyNames() {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter((p) =>
      (this.constructor as typeof ReactiveObject).elementProperties.has(p)
    );
  }

  getLineageStatePropertyNames() {
    return [
      ...(this.constructor as typeof ReactiveObject).elementProperties.keys(),
    ].filter((name) => this.hasOwnProperty(`__${String(name)}`));
  }
}

export {state} from './decorators/state.js';
