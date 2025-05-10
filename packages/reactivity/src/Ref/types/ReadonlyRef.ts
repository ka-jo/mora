import type { Observable, Observer } from "@/common/types";
import type { $ref, $flags, $version, $subscribers } from "@/common/symbols";
import type { Flags } from "@/common/flags";
import type { Ref, RefConstructor } from "@/Ref/types";
import type { RefSubscription } from "@/Ref/core/RefSubscription";

/**
 * An instance of {@link Ref} with no means of setting the value. {@link RefConstructor.readonly | Ref.readonly}
 * returns a ReadonlyRef as does {@link RefConstructor.computed | Ref.computed} if no setter is provided.
 *
 * @public
 */
export interface ReadonlyRef<TGet> extends Observable<TGet> {
	/**
	 * The state of any flags that are set on the ref. Refer to {@link Flags} for possible
	 * states tracked with this field.
	 *
	 * @private
	 */
	[$flags]: number;
	/**
	 * The version of the ref value. This is incremented each time the value changes,
	 * using `===` to determine if the value requires a new version. This is used by
	 * computed refs to determine if dependencies changed after being marked dirty.
	 *
	 * @private
	 */
	[$version]: number;
	/**
	 * The set of all current subscribers to the ref. This property is mutated
	 * directly by {@link RefSubscription} to manage the subscription lifecycle.
	 *
	 * @private
	 */
	[$subscribers]: Set<RefSubscription>;
	/**
	 * The ref symbol is used internally to identify ref instances. It is not indended
	 * to be used by consumers but is included here to act as a type brand.
	 *
	 * @internal
	 */
	[$ref]: ReadonlyRef<TGet>;
	/**
	 * Returns the current value of the ref. Calling this method will register the
	 * ref as a dependency in the current tracking context, if one exists.
	 *
	 * @public
	 */
	get(): TGet;
	/**
	 * Subscribes to the ref, allowing the subscriber to be notified of changes to
	 * the value, errors, and/or when the ref is completed.
	 *
	 * @param observer an {@link Observer} object with callbacks for `next`, `error`, and/or `complete`.
	 * @returns a {@link RefSubscription} object that can be used to manage the subscription.
	 *
	 * @public
	 */
	subscribe(observer: Partial<Observer<TGet>>): RefSubscription;
	/**
	 * Subscribes to the ref, allowing the subscriber to be notified of changes to
	 * the value, errors, and/or when the ref is completed.
	 *
	 * @param onNext the function to be called when the ref value changes.
	 * @param onError (optional) the function to be called when an error occurs.
	 * @param onComplete (optional) the function to be called when the ref is completed.
	 *
	 * @public
	 */
	subscribe(
		onNext: Observer<TGet>["next"],
		onError?: Observer<TGet>["error"],
		onComplete?: Observer<TGet>["complete"]
	): RefSubscription;
	/**
	 * A function that returns the ref instance itself. This is required when
	 * implementing custom observables to ensure interop with other observable libraries.
	 *
	 * @public
	 */
	[Symbol.observable](): ReadonlyRef<TGet>;
}
