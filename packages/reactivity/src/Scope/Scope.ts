import type { ScopeOptions, ScopeConstructor } from "@/Scope/types";
import { $children, $parent } from "@/common/symbols";
import { InteropObservable } from "@/common/types";
import { BaseScope } from "@/Scope/core/BaseScope";

export interface Scope {
	/**
	 * Internal link to the parent scope, or null if detached.
	 * @internal
	 */
	readonly [$parent]: Scope | null;

	/**
	 * Internal list of immediate child scopes. Set to null when the scope is disposed.
	 * @internal
	 */
	readonly [$children]: Array<Scope> | null;

	/**
	 * Returns an iterator of all observables that have been observed by this scope.
	 * @remarks
	 * Iteration order is not guaranteed and the iterator is live; observables could be added or
	 * removed during iteration. If you need a stable snapshot, use `Array.from(scope.observables())`.
	 * @public
	 */
	observables(): IterableIterator<InteropObservable>;

	/**
	 * Returns an iterator of all child scopes.
	 * @remarks
	 * Iteration order is not guaranteed and the iterator is live; children could be added or
	 * removed during iteration. If you need a stable snapshot, use `Array.from(scope.scopes())`.
	 * @public
	 */
	scopes(): IterableIterator<Scope>;

	/** Dispose this scope and all of its descendants. Idempotent. */
	dispose(): void;

	/**
	 * Observe an observable value within the scope's current collection window. No-op if
	 * the scope isn't actively collecting dependencies.
	 */
	observe(observable: InteropObservable): void;
}

/**
 * @public
 */
export const Scope: ScopeConstructor = Object.defineProperties(function Scope(
	options?: ScopeOptions
) {
	return new BaseScope(options);
},
{});
