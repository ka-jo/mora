import { Observable, Observer } from "@/common/types";
import { $Observable } from "@/common/symbols";
import { RefSubscription } from "@/Ref/RefSubscription";

export interface RefInstance<TGet, TSet = TGet> extends Observable<TGet> {
	get(): TGet;
	set(value: TSet): void;
	subscribe(observer: Partial<Observer<TGet>>): RefSubscription;
	subscribe(
		onNext: Observer<TGet>["next"],
		onError?: Observer<TGet>["error"],
		onComplete?: Observer<TGet>["complete"]
	): RefSubscription;
	[$Observable](): RefInstance<TGet, TSet>;
	abort(): void;
}
