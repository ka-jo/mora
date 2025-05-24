import { Flags } from "@/common/flags";
import {
	$subscribers,
	$options,
	$flags,
	$ref,
	$value,
	$dependencies,
	$observable,
	$version,
	$compute,
	$observer,
} from "@/common/symbols";
import {
	popTrackingContext,
	pushTrackingContext,
	track,
	TrackingContext,
} from "@/common/tracking-context";
import type { Observable, Observer } from "@/common/types";
import { Dependency } from "@/common/Dependency";
import { createObserver } from "@/common/util";
import { Subscription } from "@/common/Subscription";
import type { ComputedRefOptions, WritableComputedRefOptions } from "@/Ref/types";
import type { Ref } from "@/Ref/Ref";

/** We use this to mark a ref that hasn't been computed yet. */
const INITIAL_VALUE: any = $value;

/**
 * @internal
 */
export class ComputedRef<TGet = unknown, TSet = TGet> implements Ref<TGet, TSet> {
	declare [$subscribers]: Set<Subscription>;
	declare [$dependencies]: Array<Dependency>;
	declare [$flags]: number;
	declare [$version]: number;
	declare [$value]: TGet;
	declare [$ref]: ComputedRef<TGet, TSet>;
	declare [$options]: ComputedRefOptions<TGet> | WritableComputedRefOptions<TGet, TSet>;
	declare [$observer]: Partial<Observer>;
	declare [$compute]: () => void;

	constructor(options: ComputedRefOptions<TGet> | WritableComputedRefOptions<TGet, TSet>) {
		this[$subscribers] = new Set();
		this[$dependencies] = [];
		this[$flags] = Flags.Dirty;
		this[$version] = 0;
		this[$value] = INITIAL_VALUE;
		this[$ref] = this;
		this[$options] = options;
		this[$observer] = ComputedRef.initObserver(this);
		this[$compute] = ComputedRef.compute.bind(ComputedRef, this);

		if (options.signal) {
			this.abort = this.abort.bind(this);
			options.signal.addEventListener("abort", this.abort);
		}
	}

	get(): TGet {
		if (this[$flags] & Flags.Aborted) {
			return this[$value] as TGet;
		}

		track(this, $value);

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

		return Subscription.init(this, createObserver(onNextOrObserver, onError, onComplete));
	}

	[$observable]() {
		return this;
	}

	abort(): void {
		ComputedRef.unsubscribeFromDependencies(this);

		Subscription.notifyAllComplete(this[$subscribers]);

		this[$flags] |= Flags.Aborted;
		this[$subscribers] = null as any;
		this[$dependencies] = null as any;
		if (this[$options]?.signal) {
			this[$options].signal.removeEventListener("abort", this.abort);
		}
	}

	private static compute(ref: ComputedRef<any>): void {
		// A ref may have been queued to compute but was computed before the queue was flushed.
		// This would be the case if `get` was called on the ref or a dependency of the ref
		if (!(ref[$flags] & Flags.Dirty)) return;

		ref[$flags] &= ~(Flags.Dirty | Flags.Queued);

		if (ref[$value] !== INITIAL_VALUE && !ComputedRef.hasOutdatedDependenciesAfterCompute(ref))
			return;

		ComputedRef.unsubscribeFromDependencies(ref);

		pushTrackingContext();
		const computedValue = ComputedRef.tryGet(ref);
		ref[$dependencies] = ComputedRef.initDependencies(ref[$observer], popTrackingContext()!);
		if (computedValue !== ref[$value]) {
			ref[$value] = computedValue;
			ref[$version]++;
			Subscription.notifyAllNext(ref[$subscribers], computedValue);
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
		if (ref[$flags] & Flags.Queued || ref[$subscribers].size === 0) return;

		Subscription.notifyAllDirty(ref[$subscribers]);

		ref[$flags] |= Flags.Queued;
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
			if (dep.isDirty && dep.source[$compute]) dep.source[$compute]();

			if (dep.isOutdated) return true;
		}
		return false;
	}

	/**
	 * Unsubscribes from all dependencies for the computed ref.
	 * @remarks
	 * This is used when the ref is computed to ensure that its list of dependencies
	 * always reflects the last time it was computed.
	 * @param ref
	 */
	private static unsubscribeFromDependencies(ref: ComputedRef<any>): void {
		for (const dep of ref[$dependencies]) {
			dep.subscription.unsubscribe();
		}
	}

	/**
	 * Attempts to get the value of a ref, catching any errors that may occur. If an error occurs,
	 * it notifies all subscribers of the error.
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

			Subscription.notifyAllError(ref[$subscribers], e as Error);

			throw e;
		}
	}

	/**
	 * This function subscribes to a list of observables using the provided observer and uses the subscriptions
	 * to populate an array of dependencies.
	 * @param observer - The observer to use when subscribing to the dependencies
	 * @param observables - The set of all observables to subscribe to and use as sources for the dependencies
	 * @returns an array of dependencies
	 */
	private static initDependencies(
		observer: Partial<Observer>,
		trackingContext: TrackingContext
	): Array<Dependency> {
		const dependencies = new Array<Dependency>();
		let i = 0;
		for (const { source, property } of trackingContext) {
			// This isn't a ref access so we can ignore it
			if (property !== $value) continue;

			dependencies[i++] = new Dependency(source, source.subscribe(observer));
		}
		return dependencies;
	}
}
