export interface RefInstance<TGet, TSet = TGet> {
  get(): TGet;
  set(value: TSet): void;
  subscribe(fn: (value: TGet) => void): () => void;
  [Symbol.observable](): RefInstance<TGet, TSet>;
}
