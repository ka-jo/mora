import type { Observable, Observer } from "@/common/types";
import { $flags, $observable, $observer, $subscribers } from "@/common/symbols";
import { Flags } from "@/common/flags";
import { NO_OP } from "@/common/util";

/**
 * A subscription implementation intedended to be used to manage subscriptions for any
 * Observables in Mora (i.e. Refs and Stores).
 * It allows enabling/disabling a subscription without closing it entirely.
 *
 * @privateRemarks
 * To manage the subscription's lifecycle, this class mutates an Observable's set of
 * Subscribers directly.
 *
 * @public
 */
export class Subscription {
	[$flags]: number = Flags.Enabled;
	[$observable]: Observable;
	[$observer]: Observer;

	constructor(observable: Observable, observer: Observer<unknown>) {
		this[$observable] = observable;
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

		this[$observable][$subscribers].delete(this);
		Subscription.cleanup(this);
	}

	enable(): void {
		this[$flags] |= Flags.Enabled;
	}

	disable(): void {
		this[$flags] &= ~Flags.Enabled;
	}

	private static readonly CLOSED_SUBSCRIPTION: Subscription = Object.freeze({
		[$flags]: Flags.Aborted,
		unsubscribe: NO_OP,
		enable: NO_OP,
		disable: NO_OP,
		closed: true,
		enabled: false,
	}) as Subscription;

	static init(observable: Observable, observer: Observer): Subscription {
		if (observable[$flags] & Flags.Aborted) {
			observer.complete();
			return Subscription.CLOSED_SUBSCRIPTION;
		}
		const subscription = new Subscription(observable, observer);
		observable[$subscribers].add(subscription);
		return subscription;
	}

	static notifyNext(subscription: Subscription, value: unknown) {
		if (subscription[$flags] & Flags.Enabled) subscription[$observer].next(value);
	}

	static notifyAllNext(subscriptions: Set<Subscription>, value: unknown) {
		for (const subscription of subscriptions) Subscription.notifyNext(subscription, value);
	}

	static notifyError(subscription: Subscription, error: Error) {
		if (subscription[$flags] & Flags.Enabled) subscription[$observer].error(error);
	}

	static notifyAllError(subscriptions: Set<Subscription>, error: Error) {
		for (const subscription of subscriptions) Subscription.notifyError(subscription, error);
	}

	static notifyComplete(subscription: Subscription) {
		if (subscription[$flags] & Flags.Enabled) subscription[$observer].complete();

		Subscription.cleanup(subscription);
	}

	static notifyAllComplete(subscriptions: Set<Subscription>) {
		for (const subscription of subscriptions) Subscription.notifyComplete(subscription);
	}

	static notifyAllDirty(subscriptions: Set<Subscription>) {
		for (const subscription of subscriptions) subscription[$observer].dirty();
	}

	static cleanup(subscription: Subscription) {
		subscription[$flags] = Flags.Aborted;
		subscription[$observable] = null as any;
		subscription[$observer] = null as any;
	}
}
