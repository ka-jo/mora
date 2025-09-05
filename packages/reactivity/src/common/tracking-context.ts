import { Observable, Observer } from "@/common/types";
import { Dependency } from "@/common/Dependency";
import { $value } from "@/common/symbols";
import { NO_OP } from "@/common/util";

const CONTEXT_STACK = new Array<DependencySet>();
let _currentContext: DependencySet | undefined = undefined;

export function pushTrackingContext(observer: Partial<Observer>): DependencySet {
	const context = new DependencySet(observer);
	CONTEXT_STACK.push(context);
	return (_currentContext = context);
}

export function popTrackingContext(): DependencySet | undefined {
	const context = CONTEXT_STACK.pop();
	_currentContext = CONTEXT_STACK[CONTEXT_STACK.length - 1];
	return context;
}

export function isTrackingContext(): boolean {
	return _currentContext !== undefined;
}

/**
 * Tracks the access of an observable property. If there is an active tracking context and the property
 * is $value, it will immediately create a subscription and store the dependency.
 *
 * @param source - The observable that was accessed
 * @param property - The property that was accessed
 * @returns true if there is an active tracking context, false otherwise
 */
export function track(source: Observable, property: PropertyKey): boolean {
	if (_currentContext && property === $value) {
		_currentContext.track(source, property);
		return true;
	}

	return false;
}

/**
 * @internal
 * A dependency set that extends Array to store dependencies while keeping
 * the observer reference for internal subscription creation.
 */
export class DependencySet extends Array<Dependency> {
	private declare readonly observer: Partial<Observer>;

	constructor(observer: Partial<Observer>) {
		super();
		this.observer = observer;
	}

	/**
	 * Tracks a dependency by creating a subscription to the observable source and storing
	 * the resulting dependency. This method is called during reactive computation to
	 * eagerly establish subscriptions for all accessed observables.
	 *
	 * @param source - The observable source that was accessed during tracking
	 * @param property - The property key that was accessed (typically $value)
	 */
	track(source: Observable, property: PropertyKey): void {
		const subscription = source.subscribe(this.observer);
		this.push(new Dependency(source, subscription));
	}

	/**
	 * Unsubscribes from all dependencies in this dependency set.
	 */
	unsubscribe(): void {
		for (const dep of this) {
			dep.subscription.unsubscribe();
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
