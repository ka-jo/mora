import type { Observable, Observer } from "@/common/types";
import { $flags, $next, $observable, $observer, $prev, $subscribers } from "@/common/symbols";
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
	[$prev]: Subscription | null = null;
	[$next]: Subscription | null = null;

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
		if (this[$flags] & Flags.Aborted) return;

		if (this[$prev]) {
			this[$prev][$next] = this[$next];
		} else {
			// We're the head, update the list's head
			this[$observable][$subscribers].head = this[$next];
		}

		if (this[$next]) {
			this[$next][$prev] = this[$prev];
		}

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

	static cleanup(subscription: Subscription) {
		subscription[$flags] = Flags.Aborted;
		subscription[$observable] = null as any;
		subscription[$observer] = null as any;
		subscription[$prev] = null;
		subscription[$next] = null;
	}
}
