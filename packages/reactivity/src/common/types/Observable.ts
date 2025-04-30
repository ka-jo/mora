import { $Observable } from "@/common/symbols";
import { Observer, Subscription } from "@/common/types";

export interface Observable<T> {
	subscribe(observer: Partial<Observer<T>>): Subscription;
	subscribe(
		onNext: Observer<T>["next"],
		onError?: Observer<T>["error"],
		onComplete?: Observer<T>["complete"]
	): Subscription;
	[$Observable](): Observable<T>;
}
