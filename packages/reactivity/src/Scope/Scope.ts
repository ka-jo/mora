import type { ScopeOptions, ScopeConstructor } from "@/Scope/types";
import { $children, $flags, $parent, $dependencies } from "@/common/symbols";
import type { Dependency } from "@/common/Dependency";
import { Observable } from "@/common/types";

export interface Scope {
	/**
	 * Internal link to the parent scope, or null if detached.
	 * @internal
	 */
	readonly [$parent]: Scope | null;
	/**
	 * Internal list of immediate child scopes.
	 * @internal
	 */
	readonly [$children]: ReadonlyArray<Scope>;
	/**
	 * Internal flags bitfield used across Mora primitives (e.g., Aborted).
	 * Included here solely to brand implementors and enable internal checks.
	 * @internal
	 */
	readonly [$flags]: number;

	/**
	 * Internal array of {@link dependencies Dependency} collected by this scope.
	 * @internal
	 */
	readonly [$dependencies]: Array<Dependency>;

	/** Dispose this scope and all of its descendants. Idempotent. Also an Observable<void>. */
	dispose: (() => void) & Observable<void>;

	/**
	 * Observe an observable value within the scope's current collection window. No-op if
	 * the scope isn't actively collecting dependencies.
	 */
	observe(observable: Observable): void;
}

/**
 * @public
 */
export const Scope: ScopeConstructor = Object.defineProperties(function Scope(
	options?: ScopeOptions
) {
	throw new Error("Scope not implemented yet");
},
{});
