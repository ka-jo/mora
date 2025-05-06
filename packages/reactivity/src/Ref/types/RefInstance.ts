import { Observable, Observer } from "@/common/types";
import { $flags, $observable, $subscribers } from "@/common/symbols";
import { RefSubscription } from "@/Ref/RefSubscription";

export interface RefInstance<TGet = unknown, TSet = TGet>
	extends Observable<TGet> {
	[$flags]: number;
	[$subscribers]: Set<RefSubscription>;
	get(): TGet;
	set(value: TSet): void;
	subscribe(observer: Partial<Observer<TGet>>): RefSubscription;
	subscribe(
		onNext: Observer<TGet>["next"],
		onError?: Observer<TGet>["error"],
		onComplete?: Observer<TGet>["complete"]
	): RefSubscription;
	[$observable](): RefInstance<TGet, TSet>;
	abort(): void;
}
