import { Observer } from "@/common/types";
import {
	$observable,
	$value,
	$subscribers,
	$flags,
	$ref,
	$options,
	$dependencies,
} from "@/common/symbols";
import { createObserver, isObject } from "@/common/util";
import { Flags } from "@/common/flags";
import { track } from "@/common/tracking-context";
import { Subscription } from "@/common/Subscription";
import { SubscriptionList } from "@/common/SubscriptionList";
import type { RefOptions } from "@/Ref/types";
import type { Ref } from "@/Ref/Ref";
import { isRef } from "@/Ref/isRef";
import { BaseStore } from "@/Store/core/BaseStore";

const $forwardObserver = Symbol("forward-observer");

/**
 * @internal
 */
export class BaseRef<T = unknown> implements Ref<T, T> {
	declare [$subscribers]: SubscriptionList;
	declare [$flags]: number;
	declare [$value]: T;
	declare [$ref]: BaseRef<T>;
	declare [$options]?: RefOptions;
	declare [$dependencies]?: Subscription;
	declare [$forwardObserver]?: Partial<Observer<T>>;

	constructor(value: T | Ref<T>, options?: RefOptions) {
		this[$subscribers] = new SubscriptionList();
		this[$flags] = 0;
		this[$ref] = this;
		this[$options] = options;

		BaseRef.initValue(this, value);

		if (options?.signal) {
			this.abort = this.abort.bind(this);
			options.signal.addEventListener("abort", this.abort);
		}
	}

	get(): T {
		if (!(this[$flags] & Flags.Aborted)) {
			track(this, $value);
		}
		return this[$value];
	}

	set(value: T | Ref<T>): boolean {
		// Setting a ref's value should stop any forwarding subscriptions regardless of if the
		// value is different or not
		this[$dependencies]?.unsubscribe();

		if (Object.is(this[$value], value)) return true;

		BaseRef.initValue(this, value);

		if (this[$flags] & Flags.Aborted) return true;

		this[$subscribers].next(value);

		return true;
	}

	subscribe(
		onNextOrObserver: Partial<Observer<T>> | Observer<T>["next"],
		onError?: Observer<T>["error"],
		onComplete?: Observer<T>["complete"]
	): Subscription {
		return this[$subscribers].initSubscription(this, onNextOrObserver, onError, onComplete);
	}

	[$observable](): Ref<T, T> {
		return this;
	}

	abort(): void {
		this[$dependencies]?.unsubscribe();

		this[$subscribers].complete();

		this[$flags] |= Flags.Aborted;
		if (this[$options]?.signal) {
			this[$options].signal.removeEventListener("abort", this.abort);
		}
	}

	private static initValue<T>(ref: BaseRef<T>, value: T | Ref<T>): void {
		if (isRef(value)) {
			BaseRef.forwardRef(ref, value);
		} else if (!(ref[$flags] & Flags.Shallow) && isObject(value)) {
			ref[$value] = BaseStore.create(value);
		} else {
			ref[$value] = value;
		}
	}

	/**
	 * This method is used to forward the value of a source ref to a target ref. It subscribes to
	 * the source ref using the {@link BaseRef.forwardValue} method, which will update the
	 * target ref's value and notify all subscribers of the target ref.
	 *
	 * @param target - The target ref that will receive its value from the source ref
	 * @param source - The source ref that will forward its value to the target ref
	 * @returns the source ref's value
	 */
	private static forwardRef<T>(target: BaseRef<T>, source: Ref<T>): void {
		let forwardObserver = target[$forwardObserver];
		if (!forwardObserver)
			forwardObserver = target[$forwardObserver] = createObserver(
				BaseRef.forwardValue.bind(BaseRef, target)
			);

		target[$dependencies] = source.subscribe(forwardObserver);

		target[$value] = source.get();
	}

	/**
	 * This method is used to forward a value to a target ref. It's safe to assume that the source
	 * ref has already performed the necessary checks to ensure that the value is new.
	 *
	 * @param target - The target ref that's receiving the value
	 * @param value - The value to forward to the target ref
	 */
	private static forwardValue<T>(target: BaseRef<T>, value: T): void {
		if (!(target[$flags] & Flags.Shallow) && isObject(value)) {
			target[$value] = BaseStore.create(value);
		} else {
			target[$value] = value;
		}

		if (target[$flags] & Flags.Aborted) return;

		target[$subscribers].next(value);
	}
}
