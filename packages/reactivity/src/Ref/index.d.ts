import "symbol-observable";

import { Observer } from "../common/types";
import { RefOptions, ComputedRefOptions, WritableComputedRefOptions } from "./types";

declare const $ref: unique symbol;

export interface Ref<TGet, TSet = TGet> {
	[$ref]: Ref<TGet, TSet>;
	get(): TGet;
	set(value: TSet): void;
	subscribe(observer: Partial<Observer<TGet>>): RefSubscription;
	subscribe(
		onNext: Observer<TGet>["next"],
		onError?: Observer<TGet>["error"],
		onComplete?: Observer<TGet>["complete"]
	): RefSubscription;
	[Symbol.observable](): Ref<TGet, TSet>;
	abort(): void;
}

export interface ReadonlyRef<TGet> {
	[$ref]: ReadonlyRef<TGet>;
	get(): TGet;
	subscribe(observer: Partial<Observer<TGet>>): RefSubscription;
	subscribe(
		onNext: Observer<TGet>["next"],
		onError?: Observer<TGet>["error"],
		onComplete?: Observer<TGet>["complete"]
	): RefSubscription;
	[Symbol.observable](): ReadonlyRef<TGet>;
	abort(): void;
}

export interface RefSubscription {
	readonly closed: boolean;
	readonly enabled: boolean;
	unsubscribe(): void;
	enable(): void;
	disable(): void;
}

export interface RefConstructor {
	<TGet, TSet = TGet>(value: TGet, options?: RefOptions): Ref<TGet, TSet>;
	new <TGet, TSet = TGet>(value: TGet, options?: RefOptions): Ref<TGet, TSet>;

	isRef<T>(value: Ref<T> | unknown): value is Ref<T>;

	computed<TGet, TSet = TGet>(options: WritableComputedRefOptions<TGet, TSet>): Ref<TGet, TSet>;
	computed<TGet>(getter: () => TGet): ReadonlyRef<TGet>;
	computed<TGet>(options: ComputedRefOptions<TGet>): ReadonlyRef<TGet>;
}

export const Ref: RefConstructor;
