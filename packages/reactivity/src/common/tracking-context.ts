import { RefInstance } from "@/Ref/types";

const CONTEXT_STACK = new Array<RefInstance[]>();

export function pushTrackingContext(): RefInstance[] {
	const context = new Array<RefInstance>();
	CONTEXT_STACK.push(context);
	return context;
}

export function popTrackingContext(): RefInstance[] | undefined {
	return CONTEXT_STACK.pop();
}

export function isTrackingContext(): boolean {
	return CONTEXT_STACK.length > 0;
}

export function track(ref: RefInstance): void {
	const stackLength = CONTEXT_STACK.length;
	if (stackLength > 0) {
		CONTEXT_STACK[stackLength - 1].push(ref);
	}
}
