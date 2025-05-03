import { Observer, Subscription } from "@/common/types";

/**
 * A subscription implementation intedended to be used to manage subscriptions to Refs.
 * It allows enabling/disabling a subscription without closing it entirely.
 * @remarks
 * To manage the subscription's lifecycle, this class acts mutates a Ref's observers Set
 * directly, so it's important that the Ref always has a reference to the same Set.
 */
export class RefSubscription implements Subscription {
	constructor(
		private _observers: Set<Observer<unknown>>,
		private _observer: Observer<unknown>
	) {
		_observers.add(_observer);
	}

	get closed(): boolean {
		return this._observer === null;
	}

	get isEnabled(): boolean {
		return this._observers.has(this._observer);
	}

	unsubscribe(): void {
		this._observers.delete(this._observer);
		this._observers = null as any;
		this._observer = null as any;
	}

	enable(): void {
		if (this.isEnabled) return;

		this._observers.add(this._observer);
	}

	disable(): void {
		if (!this.isEnabled) return;

		this._observers.delete(this._observer);
	}
}
