import type { Scope } from "@/Scope/Scope";
import type { ScopeOptions } from "@/Scope/types";

/**
 * The constructor type for the Scope factory function.
 *
 * @public
 */
export interface ScopeConstructor {
	(options?: ScopeOptions): Scope;
	new (options?: ScopeOptions): Scope;

	/**
	 * Type guard that checks if a value is an implementation of the {@link Scope Scope interface}
	 *
	 * @param value - the value to check
	 * @returns `true` if the value is an implementation of the {@link Scope Scope interface}, `false` otherwise
	 *
	 * @public
	 */
	isScope(value: Scope | unknown): value is Scope;
}
