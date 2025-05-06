import { Flags } from "@/common/flags";
import {
	$subscribers,
	$options,
	$flags,
	$ref,
	$value,
	$dependencies,
	$observable,
} from "@/common/symbols";
import {
	popTrackingContext,
	pushTrackingContext,
	track,
} from "@/common/tracking-context";
import { Observer, Subscription } from "@/common/types";
import { RefInstance, ComputedRefOptions } from "@/Ref/types";
import { RefSubscription } from "@/Ref/RefSubscription";
import { createObserver } from "@/common/util";

const $observer = Symbol("observer");
const $compute = Symbol("compute");

export class ComputedRef<TGet = unknown, TSet = TGet>
	implements RefInstance<TGet, TSet>
{
	[$subscribers]: Set<RefSubscription> = new Set();
	[$dependencies]: Array<Subscription> = [];
	[$flags]: number;
	[$value]?: TGet;
	[$ref]: ComputedRef<TGet, TSet>;
	[$options]: ComputedRefOptions<TGet, TSet>;
	[$observer]: Partial<Observer>;
	[$compute]: () => void;

	constructor(options: ComputedRefOptions<TGet, TSet>) {
		this[$flags] = Flags.Dirty;
		this[$options] = options;
		this[$ref] = this;
		this[$observer] = {
			next: ComputedRef.onDependencyChange.bind(ComputedRef, this),
		};
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

		track(this);

		if (this[$flags] & Flags.Dirty) {
			ComputedRef.compute(this);
		}

		return this[$value] as TGet;
	}

	set(value: TSet): void {
		if (this[$flags] & Flags.Aborted) return;

		if (!this[$options].set)
			throw new TypeError("Cannot set a computed ref defined without a setter");

		this[$options].set(value);
	}

	subscribe(
		onNextOrObserver: Partial<Observer<TGet>> | Observer<TGet>["next"],
		onError?: Observer<TGet>["error"],
		onComplete?: Observer<TGet>["complete"]
	): RefSubscription {
		const observer = createObserver(onNextOrObserver, onError, onComplete);

		return RefSubscription.init(this, observer);
	}

	[$observable]() {
		return this;
	}

	abort(): void {
		for (const dep of this[$dependencies]) {
			dep.unsubscribe();
		}
		for (const sub of this[$subscribers]) {
			RefSubscription.notifyComplete(sub);
		}
		this[$flags] |= Flags.Aborted;
		this[$subscribers] = null as any;
		this[$dependencies] = null as any;
		if (this[$options]?.signal) {
			this[$options].signal.removeEventListener("abort", this.abort);
		}
	}

	private static compute(ref: ComputedRef<any>): void {
		// If the dirty flag is not set by the time we reach this point, it means `get`
		// was called before the microtask queue was flushed, and it was already computed
		if (!(ref[$flags] & Flags.Dirty)) return;

		ref[$flags] &= ~Flags.Dirty;
		ref[$flags] &= ~Flags.Queued;

		for (const dep of ref[$dependencies]) {
			dep.unsubscribe();
		}

		pushTrackingContext();
		try {
			ref[$value] = ref[$options].get();
		} catch (e) {
			if (e instanceof Error === false) e = new Error(String(e));

			for (const sub of ref[$subscribers]) {
				RefSubscription.notifyError(sub, e as Error);
			}

			throw e;
		}
		const dependencies = new Array<RefSubscription>();
		for (const dep of popTrackingContext()!) {
			dependencies.push(dep.subscribe(ref[$observer]));
		}
		ref[$dependencies] = dependencies;
	}

	private static onDependencyChange(ref: ComputedRef<any>, value: unknown) {
		ref[$flags] |= Flags.Dirty;
		// If the ref is already queued or has no active susbscribers, we don't need to queue it
		if (ref[$flags] & Flags.Queued || ref[$subscribers].size === 0) return;

		ref[$flags] |= Flags.Queued;
		queueMicrotask(ref[$compute]);
	}
}
