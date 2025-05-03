import { Observer } from "@/common/types";
import { $Observable, $RefValue } from "@/common/symbols";
import { createObserver } from "@/common/util";
import { RefInstance } from "@/Ref/types";
import { RefSubscription } from "@/Ref/RefSubscription";

export class BaseRef<TGet, TSet = TGet> implements RefInstance<TGet, TSet> {
	private readonly _observers: Set<Observer<TGet>> = new Set();
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
		const observer = createObserver(onNextOrObserver, onError, onComplete);

		return new RefSubscription(this._observers, observer);
	}

	[$Observable](): RefInstance<TGet, TSet> {
		return this;
	}

	abort(): void {
		throw new Error("Method not implemented.");
	}
}
