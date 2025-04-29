import Symbol_observable from "symbol-observable";

export const RefValue = Symbol("value");

export class BaseRef<TGet, TSet = TGet> {
  [RefValue]: TGet;

  constructor(value: TGet) {
    this[RefValue] = value;
  }
}
