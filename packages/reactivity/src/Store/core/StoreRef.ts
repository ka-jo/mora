import { $flags, $ref, $subscribers, $version } from "@/common/symbols";
import { Observer } from "@/common/types";
import { createObserver } from "@/common/util";
import { Subscription } from "@/common/Subscription";
import { Ref } from "@/Ref";

export class StoreRef<T = unknown> implements Ref<T, T> {
	[$flags]: number = 0;
	[$version]: number = 0;
	[$subscribers]: Set<Subscription> = new Set();
	[$ref]: Ref<T, T>;

	constructor(value: T) {
		this[$ref] = this;
	}

	get(): T {
		throw new Error("Method not implemented.");
	}

	set(value: T): boolean {
		throw new Error("Method not implemented.");
	}

	subscribe(
		onNextOrObserver: Partial<Observer<T>> | Observer<T>["next"],
		onError?: Observer<T>["error"],
		onComplete?: Observer<T>["complete"]
	): Subscription {
		const observer = createObserver(onNextOrObserver, onError, onComplete);

		return Subscription.init(this, observer);
	}

	[Symbol.observable](): Ref<T, T> {
		return this;
	}

	abort(): void {
		throw new Error("Method not implemented.");
	}
}
