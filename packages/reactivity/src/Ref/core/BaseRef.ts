import { Observer } from "@/common/types";
import {
	$observable,
	$value,
	$subscribers,
	$flags,
	$ref,
	$options,
	$version,
} from "@/common/symbols";
import { createObserver } from "@/common/util";
import { Flags } from "@/common/flags";
import { track } from "@/common/tracking-context";
import { Ref, RefOptions } from "@/Ref/types";
import { RefSubscription } from "@/Ref/core/RefSubscription";

export class BaseRef<T = unknown> implements Ref<T, T> {
	[$subscribers]: Set<RefSubscription> = new Set();
	[$flags]: number = 0;
	[$version]: number = 0;
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
		if (!(this[$flags] & Flags.Aborted)) {
			track(this);
		}
		return this[$value];
	}

	set(value: T): void {
		if (this[$value] === value) return;

		this[$value] = value;

		if (this[$flags] & Flags.Aborted) return;

		this[$version]++;

		RefSubscription.notifyAllNext(this[$subscribers], value);
	}

	subscribe(
		onNextOrObserver: Partial<Observer<T>> | Observer<T>["next"],
		onError?: Observer<T>["error"],
		onComplete?: Observer<T>["complete"]
	): RefSubscription {
		const observer = createObserver(onNextOrObserver, onError, onComplete);

		return RefSubscription.init(this, observer);
	}

	[$observable](): Ref<T, T> {
		return this;
	}

	abort(): void {
		RefSubscription.notifyAllComplete(this[$subscribers]);
		this[$flags] |= Flags.Aborted;
		this[$subscribers] = null as any;
		if (this[$options]?.signal) {
			this[$options].signal.removeEventListener("abort", this.abort);
		}
	}
}
