import type { Scope } from "@/Scope/Scope";
/**
 * Options for creating a Scope.
 *
 * @public
 */
export interface ScopeOptions {
	/**
	 * The parent scope to attach to. If omitted, the new scope will attach to the current active scope.
	 * If explicitly set to null, the new scope is detached.
	 */
	scope?: Scope | null;
	/**
	 * An AbortSignal that will trigger this scope to dispose when signaled.
	 */
	signal?: AbortSignal;
}
