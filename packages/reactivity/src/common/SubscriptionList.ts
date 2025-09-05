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
	 * Notify all subscriptions with a new value.
	 *
	 * @remarks
	 * This method iterates through all subscriptions in the list and calls their
	 * observer's `next` method. Since disabled subscriptions are removed from the
	 * list, no flag checking is needed during iteration for optimal performance.
	 *
	 * @param value - The value to send to all subscribers
	 */
	next(value: T): void {
		let subscription = this.head;
		while (subscription) {
			subscription[$observer].next(value);
			subscription = subscription[$next];
		}
	}

	/**
	 * Notify all subscriptions of an error.
	 *
	 * @remarks
	 * Since disabled subscriptions are removed from the list, no flag checking
	 * is needed during iteration for optimal performance.
	 *
	 * @param error - The error to send to all subscribers
	 */
	error(error: Error): void {
		let subscription = this.head;
		while (subscription) {
			subscription[$observer].error(error);
			subscription = subscription[$next];
		}
	}

	/**
	 * Notify all subscriptions that the observable is complete.
	 *
	 * @remarks
	 * Since disabled subscriptions are removed from the list, no flag checking
	 * is needed. All subscriptions in the list will be notified and then cleaned up.
	 */
	complete(): void {
		let subscription = this.head;
		while (subscription) {
			subscription[$observer].complete();
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
