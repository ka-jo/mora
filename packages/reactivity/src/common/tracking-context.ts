import { Observable } from "@/common/types";

const CONTEXT_STACK = new Array<Set<Observable>>();
let _currentContext: Set<Observable> | undefined = undefined;

export function pushTrackingContext(): Set<Observable> {
	const context = new Set<Observable>();
	CONTEXT_STACK.push(context);
	_currentContext = context;
	return context;
}

export function popTrackingContext(): Set<Observable> | undefined {
	return (_currentContext = CONTEXT_STACK.pop());
}

export function isTrackingContext(): boolean {
	return _currentContext !== undefined;
}

export function track(ref: Observable): void {
	if (_currentContext) {
		_currentContext.add(ref);
	}
}
