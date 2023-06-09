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

export class ReactiveObject<Interface = unknown> extends Object {
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
      set(this: ReactiveObject<unknown>, value: unknown) {
        const oldValue = (this as {} as {[key: string]: unknown})[
          name as string
        ];
        (this as {} as {[key: string]: unknown})[key as string] = value;
        (this as unknown as ReactiveObject<unknown>).requestUpdate(
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

  #defaultState?: Partial<Interface>;

  constructor(defaultState?: Partial<Interface>) {
    super();
    this._initialize();
    if (defaultState) {
      this.#defaultState = defaultState;
      this.requestUpdate();
    }
  }

  private resolvedPromise = Promise.resolve(true);

  _initialize() {
    this.__updatePromise = this.resolvedPromise;
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
        // Set the default state if it was provided
        // into the constructor.
        if (this.hasUpdated === false && this.#defaultState) {
          this.fromObject(this.#defaultState);
        }
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
  protected __update(_changedProperties: PropertyValues) {
    // this.update(_changedProperties);
  }

  protected update(_changedProperties: PropertyValues) {}

  protected updated(_changedProperties: PropertyValues) {}

  protected __firstUpdated(_changedProperties: PropertyValues) {
    // this.firstUpdated(_changedProperties);
  }

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

  lineageToJSON = false;

  toJSON(): Interface {
    return Object.fromEntries(
      (this.lineageToJSON
        ? this.getLineageStatePropertyNames()
        : this.getLocalStatePropertyNames()
      ).map((key) => [key, this[key as keyof this]])
    ) as Interface;
  }

  fromObject(state: Partial<Interface>) {
    // // The state provided needs to reflect the current instance
    // const statePropertyNames = this.getLineageStatePropertyNames();
    // console.log(statePropertyNames);
    // if (
    //   !Object.keys(state as {}).every((name) =>
    //     statePropertyNames.includes(name)
    //   )
    // ) {
    //   throw new Error(`The object doesn't reflect the nature of this instance.
    // Please use the template feature to ensure type coherence throughout your program.`);
    // }

    for (const [key, value] of Object.entries(state)) {
      (this as {} as {[key: string]: unknown})[key as string] = value;
    }
  }
}

export {state} from './decorators/state.js';
