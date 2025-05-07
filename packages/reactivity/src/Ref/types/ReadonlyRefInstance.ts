import { $flags, $observable, $subscribers, $version } from "@/common/symbols";
import { Observable, Observer } from "@/common/types";
import { RefSubscription } from "@/Ref/RefSubscription";

export interface ReadonlyRefInstance<TGet = unknown> extends Observable<TGet> {
	[$flags]: number;
	[$version]: number;
	[$subscribers]: Set<RefSubscription>;
	get(): TGet;
	subscribe(observer: Partial<Observer<TGet>>): RefSubscription;
	subscribe(
		onNext: Observer<TGet>["next"],
		onError?: Observer<TGet>["error"],
		onComplete?: Observer<TGet>["complete"]
	): RefSubscription;
	[$observable](): ReadonlyRefInstance<TGet>;
	abort(): void;
}
