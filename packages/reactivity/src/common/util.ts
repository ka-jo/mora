import type { Observer } from "@/common/types";

export const NO_OP = () => {};

export function createObserver<T>(
	onNextOrObserver: Observer<T>["next"] | Partial<Observer<T>>,
	onError?: Observer<T>["error"],
	onComplete?: Observer<T>["complete"]
): Observer<T> {
	if (typeof onNextOrObserver === "function") {
		return {
			next: onNextOrObserver,
			error: onError || NO_OP,
			complete: onComplete || NO_OP,
			dirty: NO_OP,
		};
	} else {
		return {
			next: onNextOrObserver.next || NO_OP,
			error: onNextOrObserver.error || NO_OP,
			complete: onNextOrObserver.complete || NO_OP,
			dirty: onNextOrObserver.dirty || NO_OP,
		};
	}
}
