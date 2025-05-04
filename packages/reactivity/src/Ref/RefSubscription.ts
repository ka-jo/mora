import { Flags } from "@/common/flags";
import { $flags, $ref, $subscriptions } from "@/common/symbols";
import { Observer, Subscription } from "@/common/types";
import { noop } from "@/common/util";
import { BaseRef } from "@/Ref/BaseRef";

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
	[$ref]: BaseRef;
	[$observer]: Observer;

	constructor(ref: BaseRef, observer: Observer<unknown>) {
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

		this[$ref][$subscriptions].delete(this);
		RefSubscription.cleanup(this);
	}

	enable(): void {
		this[$flags] |= Flags.Enabled;
	}

	disable(): void {
		this[$flags] &= ~Flags.Enabled;
	}

	static readonly CLOSED_SUBSCRIPTION: RefSubscription = Object.freeze({
		[$flags]: Flags.Aborted,
		unsubscribe: noop,
		enable: noop,
		disable: noop,
		closed: true,
		enabled: false,
	}) as RefSubscription;

	static notify(subscription: RefSubscription, value: unknown) {
		if (subscription[$flags] & Flags.Enabled) {
			subscription[$observer].next(value);
		}
	}

	static cleanup(subscription: RefSubscription) {
		subscription[$flags] = Flags.Aborted;
		subscription[$ref] = null as any;
		subscription[$observer] = null as any;
	}
}
