export interface HasChanged<Type = unknown> {
  (value: Type, old: Type): boolean;
}

export interface PropertyDeclaration<Type = unknown> {
  hasChanged?: HasChanged<Type>;
}

export type PropertyDeclarationMap = Map<PropertyKey, PropertyDeclaration>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PropertyValues<T = any> = T extends object
  ? PropertyValueMap<T>
  : Map<PropertyKey, unknown>;

export interface PropertyValueMap<T> extends Map<PropertyKey, unknown> {
  get<K extends keyof T>(k: K): T[K];
  set<K extends keyof T>(key: K, value: T[K]): this;
  has<K extends keyof T>(k: K): boolean;
  delete<K extends keyof T>(k: K): boolean;
}
