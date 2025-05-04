import { Observer } from "@/common/types";
import {
	$observable,
	$value,
	$subscriptions,
	$flags,
	$ref,
} from "@/common/symbols";
import { createObserver } from "@/common/util";
import { Flags } from "@/common/flags";
import { RefInstance } from "@/Ref/types";
import { RefSubscription } from "@/Ref/RefSubscription";

export class BaseRef<T = unknown> implements RefInstance<T, T> {
	[$subscriptions]: Set<RefSubscription> = new Set();
	[$flags]: number = 0;
	[$value]: T;
	[$ref]: BaseRef<T>;

	constructor(value: T) {
		this[$value] = value;
		this[$ref] = this;
	}

	get(): T {
		return this[$value];
	}

	set(value: T): void {
		if (this[$value] === value) return;

		this[$value] = value;
		for (const sub of this[$subscriptions]) {
			RefSubscription.notify(sub, value);
		}
	}

	subscribe(
		onNextOrObserver: Partial<Observer<T>> | Observer<T>["next"],
		onError?: Observer<T>["error"],
		onComplete?: Observer<T>["complete"]
	): RefSubscription {
		const observer = createObserver(onNextOrObserver, onError, onComplete);

		if (this[$flags] & Flags.Aborted) {
			observer.complete();
			return RefSubscription.CLOSED_SUBSCRIPTION;
		}

		return new RefSubscription(this, observer);
	}

	[$observable](): RefInstance<T, T> {
		return this;
	}

	abort(): void {
		for (const sub of this[$subscriptions]) {
			RefSubscription.cleanup(sub);
		}
		this[$flags] |= Flags.Aborted;
		this[$subscriptions] = null as any;
	}
}
