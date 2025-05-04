import { $observable } from "@/common/symbols";
import { Observer, Subscription } from "@/common/types";

export interface Observable<T = unknown> {
	subscribe(observer: Partial<Observer<T>>): Subscription;
	subscribe(
		onNext: Observer<T>["next"],
		onError?: Observer<T>["error"],
		onComplete?: Observer<T>["complete"]
	): Subscription;
	[$observable](): Observable<T>;
}
