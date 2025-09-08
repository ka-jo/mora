import type { ScopeOptions, ScopeConstructor } from "@/Scope/types";
import { $children, $flags, $parent } from "@/common/symbols";
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
	 *
	 * @internal
	 */
	readonly [$flags]: number;

	/** Dispose this scope and all of its descendants. Idempotent. Also an Observable<void>. */
	dispose: (() => void) & Observable<void>;
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
