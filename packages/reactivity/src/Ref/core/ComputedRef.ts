import { Flags } from "@/common/flags";
import {
	$subscribers,
	$options,
	$flags,
	$ref,
	$value,
	$dependencies,
	$observable,
	$compute,
	$observer,
} from "@/common/symbols";
import {
	popTrackingContext,
	pushTrackingContext,
	currentContext,
} from "@/common/tracking-context";
import type { Observer } from "@/common/types";
import { Subscription } from "@/common/Subscription";
import type { ComputedRefOptions, WritableComputedRefOptions } from "@/Ref/types";
import type { Ref } from "@/Ref/Ref";
import type { Dependency } from "@/common/Dependency";

/** We use this to mark a ref that hasn't been computed yet. */
const INITIAL_VALUE: any = $value;

/**
 * @internal
 */
export class ComputedRef<TGet = unknown, TSet = TGet> implements Ref<TGet, TSet> {
	declare [$subscribers]: Subscription[];
	declare [$dependencies]: Dependency[];
	declare [$flags]: number;
	declare [$value]: TGet;
	declare [$ref]: ComputedRef<TGet, TSet>;
	declare [$options]: ComputedRefOptions<TGet> | WritableComputedRefOptions<TGet, TSet>;
	declare [$observer]: Partial<Observer>;
	declare [$compute]: () => void;

	constructor(options: ComputedRefOptions<TGet> | WritableComputedRefOptions<TGet, TSet>) {
		this[$subscribers] = [];
		this[$dependencies] = [];
		this[$flags] = Flags.Dirty;
		this[$value] = INITIAL_VALUE;
		this[$ref] = this;
		this[$options] = options;
		this[$observer] = ComputedRef.initObserver(this);
		this[$compute] = ComputedRef.compute.bind(ComputedRef, this);

		if (options.signal) {
			if (options.signal.aborted) {
				this[$flags] |= Flags.Aborted;
			} else {
				this.dispose = this.dispose.bind(this);
				options.signal.addEventListener("abort", this.dispose);
			}
		}
	}

	get(): TGet {
		if (this[$flags] & Flags.Aborted) {
			return this[$value] as TGet;
		}

		if (currentContext) {
			currentContext.track(this, $value);
		}

		if (this[$flags] & Flags.Dirty) {
			ComputedRef.compute(this);
		}

		return this[$value] as TGet;
	}

	set(value: TSet): boolean {
		if (this[$flags] & Flags.Aborted) return false;

		if (!("set" in this[$options]))
			throw new TypeError("Cannot set a computed ref defined without a setter");

		this[$options].set(value);
		return true;
	}

	subscribe(
		onNextOrObserver: Partial<Observer<TGet>> | Observer<TGet>["next"],
		onError?: Observer<TGet>["error"],
		onComplete?: Observer<TGet>["complete"]
	): Subscription {
		// If the ref hasn't been computed yet, we need to compute the current value
		// in order to notify the subscriber of future values
		if (this[$value] === INITIAL_VALUE && !(this[$flags] & Flags.Aborted))
			try {
				ComputedRef.compute(this);
			} catch (e) {
				// As much as possible, the compute triggered in this case should be
				// "invisible". The subscriber should be able to think of the ref as
				// already having a value, and they're subscribing to future changes.
				// Only calls to `get` should throw, so we swallow the error here.
			}

		return Subscription.init(this, onNextOrObserver, onError, onComplete);
	}

	[$observable]() {
		return this;
	}

	dispose(): void {
		for (const dep of this[$dependencies]) {
			dep.subscription.unsubscribe();
		}

		Subscription.completeAll(this[$subscribers]);

		this[$flags] |= Flags.Aborted;
		this[$dependencies] = null as any;
		if (this[$options]?.signal) {
			this[$options].signal.removeEventListener("abort", this.dispose);
		}
	}

	private static compute(ref: ComputedRef<any>): void {
		// A ref may have been queued to compute but was computed before the queue was flushed.
		// This would be the case if `get` was called on the ref or a dependency of the ref
		if (!(ref[$flags] & Flags.Dirty)) return;

		ref[$flags] &= ~(Flags.Dirty | Flags.Queued);

		if (ref[$value] !== INITIAL_VALUE && !ComputedRef.hasOutdatedDependenciesAfterCompute(ref))
			return;

		for (const dep of ref[$dependencies]) {
			dep.subscription.unsubscribe();
		}

		pushTrackingContext(ref[$observer]);
		const computedValue = ComputedRef.tryGet(ref);
		ref[$dependencies] = popTrackingContext()!;

		if (!Object.is(computedValue, ref[$value])) {
			ref[$value] = computedValue;
			Subscription.notifyAll(ref[$subscribers], computedValue);
		}
	}

	/**
	 * Callback to use when an observable dependency changes.
	 * @param ref - The computed ref to be notified
	 * @returns
	 */
	private static onDependencyChange(ref: ComputedRef<any>) {
		ref[$flags] |= Flags.Dirty;
		// If the ref is already queued or has no active susbscribers, we don't need to queue it
		if (ref[$flags] & Flags.Queued || ref[$subscribers].length === 0) return;

		ref[$flags] |= Flags.Queued;

		Subscription.dirtyAll(ref[$subscribers]);

		queueMicrotask(ref[$compute]);
	}

	private static initObserver(ref: ComputedRef<any>): Partial<Observer> {
		const callback = ComputedRef.onDependencyChange.bind(ComputedRef, ref);
		return {
			next: callback,
			dirty: callback,
		};
	}

	/**
	 * Confirms if any dependencies are outdated ensuring that any dirty dependencies are
	 * computed first.
	 * @param ref
	 * @returns true if any of the dependencies are outdated, false otherwise
	 */
	private static hasOutdatedDependenciesAfterCompute(ref: ComputedRef): boolean {
		for (const dep of ref[$dependencies]) {
			// If dependency is dirty, recompute it first (only computable observables can be dirty)
			if (dep.source[$flags] & Flags.Dirty) dep.source[$compute]!();

			// Check if observable value has changed since this dependency was created
			if (!Object.is(dep.source[$value], dep.value)) return true;
		}
		return false;
	}

	/**
	 * Attempts to get the value of a ref, catching any errors that may occur. If an error occurs,
	 * it notifies all subscribers of the error, ensures the ref is still marked dirty, and pops
	 * the tracking context.
	 * @typeParam T
	 * @param ref
	 * @returns T
	 */
	private static tryGet<T>(ref: ComputedRef<T>): T {
		try {
			return ref[$options].get();
		} catch (e) {
			// We didn't get a value, so the ref should still be marked dirty
			ref[$flags] |= Flags.Dirty;

			if (e instanceof Error === false) e = new Error(String(e));

			Subscription.errorAll(ref[$subscribers], e as Error);

			// Ensure the tracking context is popped if an error occurs during computation
			popTrackingContext();

			throw e;
		}
	}
}
