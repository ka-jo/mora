import type { Scope, SubscriptionScope } from "@/Scope";
import type { Observable } from "@/common/types";
import { $dependencies, $observable, $observer, $value } from "@/common/symbols";
import { Subscription } from "@/common/Subscription";

export let currentScope: Scope | undefined = undefined;

export let dependencyIndex = 0;

/**
 * Sets the active scope and returns the previous active scope. Consumers should call this function
 * twice: once to set the new active scope and once to restore the previous active scope.
 *
 * @param scope - The scope to set as active. If undefined, it clears the active scope.
 * @returns void
 * @internal
 */
export function setActiveScope(scope: Scope | undefined, depIndex: number = 0): void {
	currentScope = scope;
	dependencyIndex = depIndex;
}

/**
 * Increments the dependency index and updates the subscription's cached value from its observable.
 * @param subscription
 * @internal
 */
export function reuseDependency(subscription: Subscription): void {
	subscription[$value] = subscription[$observable][$value];
	dependencyIndex++;
}

/**
 * Unsubscribes and removes all dependencies from the scope starting from the specified index.
 * @param scope - The scope from which to remove dependencies.
 * @param fromIndex - The index from which to start removing dependencies. Defaults to 0.
 * @internal
 */
export function removeDependencies(scope: SubscriptionScope, fromIndex: number = 0): void {
	const dependencies = scope[$dependencies];
	while (dependencies.length > fromIndex) {
		dependencies.pop()!.unsubscribe();
	}
}

/**
 * Creates a new subscription for the given observable and adds it to the scope's dependencies.
 * @param scope
 * @param observable
 * @internal
 */
export function createDependency(scope: SubscriptionScope, observable: Observable): void {
	const dependencies = scope[$dependencies];
	const subscription = Subscription.create(
		observable,
		scope[$observer],
		undefined,
		undefined,
		dependencyIndex
	);
	dependencies.push(subscription);
	dependencyIndex++;
}
