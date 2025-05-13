import Symbol_observable from "symbol-observable";

export const $observable: typeof Symbol.observable = Symbol_observable as any;
export const $value: unique symbol = Symbol("value");
export const $subscribers: unique symbol = Symbol("subscribers");
export const $flags: unique symbol = Symbol("flags");
export const $ref: unique symbol = Symbol("ref");
export const $options: unique symbol = Symbol("options");
export const $dependencies: unique symbol = Symbol("dependencies");
export const $version: unique symbol = Symbol("version");
export const $compute: unique symbol = Symbol("compute");
export const $observer: unique symbol = Symbol("observer");
export const $store: unique symbol = Symbol("store");
