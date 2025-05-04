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
import { RefInstance, RefOptions } from "@/Ref/types";
import { RefSubscription } from "@/Ref/RefSubscription";

const $options = Symbol("options");

export class BaseRef<T = unknown> implements RefInstance<T, T> {
	[$subscriptions]: Set<RefSubscription> = new Set();
	[$flags]: number = 0;
	[$value]: T;
	[$ref]: BaseRef<T>;
	[$options]?: RefOptions;

	constructor(value: T, options?: RefOptions) {
		this[$value] = value;
		this[$ref] = this;
		this[$options] = options;
		if (options?.signal) {
			this.abort = this.abort.bind(this);
			options.signal.addEventListener("abort", this.abort);
		}
	}

	get(): T {
		return this[$value];
	}

	set(value: T): void {
		if (this[$value] === value) return;

		this[$value] = value;

		if (this[$flags] & Flags.Aborted) return;

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

		return RefSubscription.init(this, observer);
	}

	[$observable](): RefInstance<T, T> {
		return this;
	}

	abort(): void {
		for (const sub of this[$subscriptions]) {
			RefSubscription.complete(sub);
		}
		this[$flags] |= Flags.Aborted;
		this[$subscriptions] = null as any;
		if (this[$options]?.signal) {
			this[$options].signal.removeEventListener("abort", this.abort);
		}
	}
}
