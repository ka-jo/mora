import { RefOptions } from "@/Ref/types";
import { ScopeOptions } from "@/Scope/types";

/**
 * The options used to create a readonly computed ref
 *
 * @public
 */
export interface ComputedRefOptions<TGet> extends RefOptions, ScopeOptions {
	/**
	 * A function that returns the value of the computed ref. This function should
	 * not trigger side effects nor modify any state.
	 */
	get: () => TGet;
}
