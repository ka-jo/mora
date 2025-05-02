import { Observer } from "@/common/types";
import { $Observable, $RefValue } from "@/common/symbols";
import { RefInstance, RefSubscription } from "@/Ref/types";

export class BaseRef<TGet, TSet = TGet> implements RefInstance<TGet, TSet> {
	[$RefValue]: TGet;

	constructor(value: TGet) {
		this[$RefValue] = value;
	}

	get(): TGet {
		throw new Error("Method not implemented.");
	}

	set(value: TSet): void {
		throw new Error("Method not implemented.");
	}

	subscribe(
		onNextOrObserver: Partial<Observer<TGet>> | Observer<TGet>["next"],
		onError?: Observer<TGet>["error"],
		onComplete?: Observer<TGet>["complete"]
	): RefSubscription {
		throw new Error("Method not implemented.");
	}

	[$Observable](): RefInstance<TGet, TSet> {
		return this;
	}

	abort(): void {
		throw new Error("Method not implemented.");
	}
}
