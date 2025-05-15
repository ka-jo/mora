import { Observer } from "@/common/types";
import {
	$observable,
	$value,
	$subscribers,
	$flags,
	$ref,
	$options,
	$version,
	$dependencies,
} from "@/common/symbols";
import { createObserver } from "@/common/util";
import { Flags } from "@/common/flags";
import { track } from "@/common/tracking-context";
import { Subscription } from "@/common/Subscription";
import type { RefOptions } from "@/Ref/types";
import type { Ref } from "@/Ref/Ref";
import { isRef } from "@/Ref/isRef";

const $forwardObserver = Symbol("forward-observer");

/**
 * @internal
 */
export class BaseRef<T = unknown> implements Ref<T, T> {
	[$subscribers]: Set<Subscription> = new Set();
	[$flags]: number = 0;
	[$version]: number = 0;
	[$value]!: T;
	[$ref]: BaseRef<T>;
	[$options]?: RefOptions;
	[$dependencies]?: Subscription;
	[$forwardObserver]?: Partial<Observer<T>>;

	constructor(value: T | Ref<T>, options?: RefOptions) {
		if (isRef(value)) {
			this[$value] = BaseRef.forwardRef(this, value);
		} else {
			this[$value] = value;
		}
		this[$ref] = this;
		this[$options] = options;
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

		if (this[$value] === value) return true;

		if (isRef(value)) {
			this[$value] = BaseRef.forwardRef(this, value);
		} else {
			this[$value] = value;
		}

		if (this[$flags] & Flags.Aborted) return true;

		this[$version]++;

		Subscription.notifyAllNext(this[$subscribers], value);

		return true;
	}

	subscribe(
		onNextOrObserver: Partial<Observer<T>> | Observer<T>["next"],
		onError?: Observer<T>["error"],
		onComplete?: Observer<T>["complete"]
	): Subscription {
		const observer = createObserver(onNextOrObserver, onError, onComplete);

		return Subscription.init(this, observer);
	}

	[$observable](): Ref<T, T> {
		return this;
	}

	abort(): void {
		Subscription.notifyAllComplete(this[$subscribers]);
		this[$flags] |= Flags.Aborted;
		this[$subscribers] = null as any;
		if (this[$options]?.signal) {
			this[$options].signal.removeEventListener("abort", this.abort);
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
	private static forwardRef<T>(target: BaseRef<T>, source: Ref<T>): T {
		let forwardObserver = target[$forwardObserver];
		if (!forwardObserver)
			forwardObserver = target[$forwardObserver] = createObserver(
				BaseRef.forwardValue.bind(BaseRef, target)
			);

		target[$dependencies] = source.subscribe(forwardObserver);

		return source.get();
	}

	/**
	 * This method is used to forward a value to a target ref. It's safe to assume that the source
	 * ref has already performed the necessary checks to ensure that the value is new.
	 *
	 * @param target - The target ref that's receiving the value
	 * @param value - The value to forward to the target ref
	 */
	private static forwardValue<T>(target: BaseRef<T>, value: T): void {
		target[$value] = value;

		if (target[$flags] & Flags.Aborted) return;

		target[$version]++;

		Subscription.notifyAllNext(target[$subscribers], value);
	}
}
