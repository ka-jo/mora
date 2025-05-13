import { $flags, $version, $store, $subscribers } from "@/common/symbols";
import { track } from "@/common/tracking-context";
import { Observable, Observer } from "@/common/types";
import { Subscription } from "@/common/Subscription";
import { createObserver } from "@/common/util";
import type { Store } from "@/Store/Store";

export class BaseStore<T extends object> implements ProxyHandler<T>, Observable<T> {
	[$flags]: number = 0;
	[$version]: number = 0;
	[$subscribers]: Set<Subscription> = new Set();
	[$store]: BaseStore<T>;

	constructor(object: T) {
		this[$store] = this;
		Object.defineProperty(object, $store, {
			value: this,
			enumerable: false,
			configurable: false,
			writable: false,
		});
	}

	subscribe(
		onNextOrObserver: Partial<Observer<T>> | Observer<T>["next"],
		onError?: Observer<T>["error"],
		onComplete?: Observer<T>["complete"]
	): Subscription {
		const observer = createObserver(onNextOrObserver, onError, onComplete);

		return Subscription.init(this, observer);
	}

	[Symbol.observable](): Observable<T> {
		return this;
	}

	get(target: T, prop: PropertyKey, receiver: T) {
		track(this, prop);
	}

	static create<T extends object>(object: T): Store<T> {
		return new Proxy(object, new BaseStore(object)) as Store<T>;
	}
}
