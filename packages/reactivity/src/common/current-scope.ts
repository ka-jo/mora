import type { Scope } from "@/Scope";

const SCOPE_STACK: Scope[] = [];

export let currentScope: Scope | undefined = undefined;

/**
 * @internal
 */
export function pushActiveScope(scope: Scope): Scope {
	SCOPE_STACK.push(scope);
	currentScope = scope;
	return scope;
}

/**
 * @internal
 */
export function popActiveScope(): Scope | undefined {
	const scope = SCOPE_STACK.pop();
	currentScope = SCOPE_STACK[SCOPE_STACK.length - 1];
	return scope;
}
