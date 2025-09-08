import type { Scope } from "@/Scope/Scope";
import type { ScopeOptions } from "@/Scope/types";

/**
 * The constructor type for the Scope factory function.
 *
 * @public
 */
export interface ScopeConstructor {
	(options?: ScopeOptions): Scope;
}
