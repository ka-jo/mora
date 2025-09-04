import { Subscription } from "./Subscription";
import { $flags, $observer, $prev, $next } from "./symbols";
import { Flags } from "./flags";
import { Observer, Observable } from "./types";
import { createObserver } from "./util";

/**
 * An intrinsic, doubly-linked list implementation for managing subscriptions.
 * For the most part, consumers of this class can think of it as a single observer that serves as
 * an aggregate of many observers
 * @internal
 */
export class SubscriptionList<T = unknown> implements Observer<T> {
	head: Subscription | null = null;

	/**
	 * Add a subscription to the list.
	 */
	add(subscription: Subscription): void {
		if (this.head) {
			this.head[$prev] = subscription;
			subscription[$next] = this.head;
		}
		this.head = subscription;
	}

	/**
	 * Notify all enabled subscriptions with a new value.
	 */
	next(value: T): void {
		let subscription = this.head;
		while (subscription) {
			if (subscription[$flags] & Flags.Enabled) {
				subscription[$observer].next(value);
			}
			subscription = subscription[$next];
		}
	}

	/**
	 * Notify all enabled subscriptions of an error.
	 */
	error(error: Error): void {
		let subscription = this.head;
		while (subscription) {
			if (subscription[$flags] & Flags.Enabled) {
				subscription[$observer].error(error);
			}
			subscription = subscription[$next];
		}
	}

	/**
	 * Notify all enabled subscriptions that the observable is complete.
	 */
	complete(): void {
		let subscription = this.head;
		while (subscription) {
			if (subscription[$flags] & Flags.Enabled) {
				subscription[$observer].complete();
			}
			const next = subscription[$next];
			Subscription.cleanup(subscription);
			subscription = next;
		}
	}

	/**
	 * Notify all subscriptions that their dependencies are dirty.
	 */
	dirty(): void {
		let subscription = this.head;
		while (subscription) {
			subscription[$observer].dirty();
			subscription = subscription[$next];
		}
	}

	/**
	 * Initialize a new subscription for the given observable.
	 * This centralizes the common subscription creation pattern.
	 */
	initSubscription<T>(
		observable: Observable<T>,
		onNextOrObserver: Partial<Observer<T>> | Observer<T>["next"],
		onError?: Observer<T>["error"],
		onComplete?: Observer<T>["complete"]
	): Subscription {
		const observer = createObserver(onNextOrObserver, onError, onComplete);
		return Subscription.init(observable, observer);
	}
}
