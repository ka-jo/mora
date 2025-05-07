import { Flags } from "@/common/flags";
import { $flags, $ref, $subscribers } from "@/common/symbols";
import { Observer, Subscription } from "@/common/types";
import { NO_OP } from "@/common/util";
import { RefInstance } from "@/Ref/types";

const $observer = Symbol("observer");

/**
 * A subscription implementation intedended to be used to manage subscriptions to Refs.
 * It allows enabling/disabling a subscription without closing it entirely.
 * @remarks
 * To manage the subscription's lifecycle, this class mutates a Ref's observers Set
 * directly.
 */
export class RefSubscription implements Subscription {
	[$flags]: number = Flags.Enabled;
	[$ref]: RefInstance;
	[$observer]: Observer;

	constructor(ref: RefInstance, observer: Observer<unknown>) {
		this[$ref] = ref;
		this[$observer] = observer;
	}

	get closed(): boolean {
		return (this[$flags] & Flags.Aborted) === Flags.Aborted;
	}

	get enabled(): boolean {
		return (this[$flags] & Flags.Enabled) === Flags.Enabled;
	}

	unsubscribe(): void {
		if (this.closed) return;

		this[$ref][$subscribers].delete(this);
		RefSubscription.cleanup(this);
	}

	enable(): void {
		this[$flags] |= Flags.Enabled;
	}

	disable(): void {
		this[$flags] &= ~Flags.Enabled;
	}

	private static readonly CLOSED_SUBSCRIPTION: RefSubscription = Object.freeze({
		[$flags]: Flags.Aborted,
		unsubscribe: NO_OP,
		enable: NO_OP,
		disable: NO_OP,
		closed: true,
		enabled: false,
	}) as RefSubscription;

	static init(ref: RefInstance, observer: Observer): RefSubscription {
		if (ref[$flags] & Flags.Aborted) {
			observer.complete();
			return RefSubscription.CLOSED_SUBSCRIPTION;
		}
		const subscription = new RefSubscription(ref, observer);
		ref[$subscribers].add(subscription);
		return subscription;
	}

	static notifyNext(subscription: RefSubscription, value: unknown) {
		if (subscription[$flags] & Flags.Enabled)
			subscription[$observer].next(value);
	}

	static notifyAllNext(subscriptions: Set<RefSubscription>, value: unknown) {
		for (const subscription of subscriptions)
			RefSubscription.notifyNext(subscription, value);
	}

	static notifyError(subscription: RefSubscription, error: Error) {
		if (subscription[$flags] & Flags.Enabled)
			subscription[$observer].error(error);
	}

	static notifyAllError(subscriptions: Set<RefSubscription>, error: Error) {
		for (const subscription of subscriptions)
			RefSubscription.notifyError(subscription, error);
	}

	static notifyComplete(subscription: RefSubscription) {
		if (subscription[$flags] & Flags.Enabled)
			subscription[$observer].complete();

		RefSubscription.cleanup(subscription);
	}

	static notifyAllComplete(subscriptions: Set<RefSubscription>) {
		for (const subscription of subscriptions)
			RefSubscription.notifyComplete(subscription);
	}

	static notifyAllDirty(subscriptions: Set<RefSubscription>) {
		for (const subscription of subscriptions) subscription[$observer].dirty();
	}

	static cleanup(subscription: RefSubscription) {
		subscription[$flags] = Flags.Aborted;
		subscription[$ref] = null as any;
		subscription[$observer] = null as any;
	}
}
