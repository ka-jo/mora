import type { Observer } from "@/common/types";
import { $observer } from "@/common/symbols";

export const NO_OP = function noop() {};

export function createObserver<T>(
	onNextOrObserver: Observer<T>["next"] | Partial<Observer<T>>,
	onError?: Observer<T>["error"],
	onComplete?: Observer<T>["complete"]
): Observer<T> {
	//@ts-expect-error: we use the symbol to cache the resolved observer on the first argument
	// itself. This should means given the same function or observer object, we will always
	// return the same resolved observer. Typescript doesn't like us trying to add a new symbol
	// that it's unaware of though, so we need to use `@ts-expect-error` here.
	let observer: Observer<T> = onNextOrObserver[$observer];

	if (observer) return observer;

	if (typeof onNextOrObserver === "function") {
		observer = {
			next: onNextOrObserver,
			error: onError || NO_OP,
			complete: onComplete || NO_OP,
			dirty: NO_OP,
		};
	} else {
		observer = {
			next: onNextOrObserver.next || NO_OP,
			error: onNextOrObserver.error || NO_OP,
			complete: onNextOrObserver.complete || NO_OP,
			dirty: onNextOrObserver.dirty || NO_OP,
		};
	}
	//@ts-expect-error
	return (onNextOrObserver[$observer] = observer);
}

export function isObject(value: unknown): value is Record<PropertyKey, unknown> {
	return typeof value === "object" && value !== null;
}
