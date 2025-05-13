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

export function track(source: Observable, property: PropertyKey): void {
	if (_currentContext) _currentContext.push({ source, property });
}

export type TrackingContext = Array<TrackedAccess>;

export type TrackedAccess = {
	readonly source: Observable;
	readonly property: PropertyKey;
};
