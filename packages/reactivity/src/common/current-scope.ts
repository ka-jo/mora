import type { Scope } from "@/Scope";

export let currentScope: Scope | undefined = undefined;

/**
 * Sets the active scope and returns the previous active scope. Consumers should call this function
 * twice: once to set the new active scope and once to restore the previous active scope.
 *
 * @param scope - The scope to set as active. If undefined, it clears the active scope.
 * @returns The previous active scope.
 * @internal
 */
export function setActiveScope(scope: Scope | undefined): Scope | undefined {
	const previousScope = currentScope;
	currentScope = scope;
	return previousScope;
}
