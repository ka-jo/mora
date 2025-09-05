import { Observable, Observer } from "@/common/types";
import { Dependency } from "@/common/Dependency";
import { $value } from "@/common/symbols";

const CONTEXT_STACK = new Array<TrackingContext>();
let _currentContext: TrackingContext | undefined = undefined;

export function pushTrackingContext(observer: Partial<Observer>): Array<Dependency> {
	const context = new TrackingContext(observer);
	CONTEXT_STACK.push(context);
	return (_currentContext = context);
}

export function popTrackingContext(): Array<Dependency> | undefined {
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

export class TrackingContext extends Array<Dependency> {
	private declare readonly observer: Partial<Observer>;

	constructor(observer: Partial<Observer>) {
		super();
		this.observer = observer;
	}

	track(source: Observable, property: PropertyKey): void {
		const subscription = source.subscribe(this.observer);
		this.push(new Dependency(source, subscription));
	}
}
