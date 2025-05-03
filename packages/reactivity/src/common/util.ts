import type { Observer } from "@/common/types";

export const noop = () => {};

export function createObserver<T>(
	onNextOrObserver: Observer<T>["next"] | Partial<Observer<T>>,
	onError?: Observer<T>["error"],
	onComplete?: Observer<T>["complete"]
): Observer<T> {
	if (typeof onNextOrObserver === "function") {
		return {
			next: onNextOrObserver,
			error: onError || noop,
			complete: onComplete || noop,
		};
	} else {
		return {
			next: onNextOrObserver.next || noop,
			error: onNextOrObserver.error || noop,
			complete: onNextOrObserver.complete || noop,
		};
	}
}
