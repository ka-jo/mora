import { Observable, Observer } from "@/common/types";
import { Subscription } from "@/common/Subscription";
import { $value, $dependenciesIndex } from "@/common/symbols";
import { NO_OP } from "@/common/util";

const CONTEXT_STACK = new Array<DependencySet>();

/**
 * The current tracking context. When not undefined, reactive accesses should be tracked.
 * Direct access to this avoids function call overhead compared to using track().
 */
export let currentContext: DependencySet | undefined = undefined;

export function pushTrackingContext(observer: Partial<Observer>): DependencySet {
	const context = new DependencySet(observer);
	CONTEXT_STACK.push(context);
	currentContext = context;
	return context;
}

export function popTrackingContext(): DependencySet | undefined {
	const context = CONTEXT_STACK.pop();
	currentContext = CONTEXT_STACK[CONTEXT_STACK.length - 1];
	return context;
}

/**
 * @internal
 * A dependency set that extends Array to store subscriptions as dependencies while keeping
 * the observer reference for internal subscription creation.
 */
export class DependencySet extends Array<Subscription> {
	private declare readonly observer: Partial<Observer>;

	constructor(observer: Partial<Observer>) {
		super();
		this.observer = observer;
	}

	/**
	 * Tracks a dependency by creating a subscription to the observable source and storing
	 * it with the proper index and snapshot value. This method is called during reactive
	 * computation to eagerly establish subscriptions for all accessed observables.
	 *
	 * @param source - The observable source that was accessed during tracking
	 * @param property - The property key that was accessed (typically $value)
	 */
	track(source: Observable, property: PropertyKey): void {
		const subscription = source.subscribe(this.observer);
		subscription[$dependenciesIndex] = this.length;
		subscription[$value] = source[$value];
		this.push(subscription);
	}

	/**
	 * Unsubscribes from all dependencies in this dependency set.
	 */
	unsubscribe(): void {
		for (const subscription of this) {
			subscription.unsubscribe();
		}
	}

	/**
	 * A singleton null object that provides safe no-op implementations of DependencySet methods.
	 * Used as a default value to avoid null checks and enable safe method calls when no
	 * dependencies exist.
	 */
	static readonly NULL: DependencySet = {
		track: NO_OP,
		unsubscribe: NO_OP,
	} as unknown as DependencySet;
}
