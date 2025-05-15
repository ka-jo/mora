import { Observable } from "@/common/types";

const CONTEXT_STACK = new Array<TrackingContext>();
let _currentContext: TrackedAccess[] | undefined = undefined;

export function pushTrackingContext(): TrackingContext {
	const context = new Array<TrackedAccess>();
	CONTEXT_STACK.push(context);
	return (_currentContext = context);
}

export function popTrackingContext(): TrackingContext | undefined {
	const context = CONTEXT_STACK.pop();
	_currentContext = CONTEXT_STACK[CONTEXT_STACK.length - 1];
	return context;
}

export function isTrackingContext(): boolean {
	return _currentContext !== undefined;
}

/**
 * Tracks the access of an observable property. If there is an active tracking context, it will push the
 * access onto the context stack and return true. If there is no active tracking context, it will return false.
 *
 * @param source - The observable that was accessed
 * @param property - The property that was accessed
 * @returns true if there is an active tracking context, false otherwise
 */
export function track(source: Observable, property: PropertyKey): boolean {
	if (_currentContext) {
		_currentContext.push({ source, property });
		return true;
	}

	return false;
}

export type TrackingContext = Array<TrackedAccess>;

export type TrackedAccess = {
	readonly source: Observable;
	readonly property: PropertyKey;
};
