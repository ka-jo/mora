import Symbol_observable from "symbol-observable";

export const $value: unique symbol = Symbol("value");
export const $observable: unique symbol = Symbol_observable as any;
export const $subscriptions: unique symbol = Symbol("subscriptions");
export const $flags: unique symbol = Symbol("flags");
export const $ref: unique symbol = Symbol("ref");
