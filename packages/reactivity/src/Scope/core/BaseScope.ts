import { InteropObservable } from "@/common/types";
import { $children, $dependencies, $parent } from "@/common/symbols";
import type { ScopeOptions } from "@/Scope/types";
import type { Scope } from "@/Scope/Scope";
import { EMPTY_ITERATOR } from "@/common/util";

/**
 * @internal
 */
export class BaseScope implements Scope {
	declare [$parent]: Scope | null;
	declare [$children]: Scope[] | null;
	declare [$dependencies]: Set<InteropObservable> | null;

	constructor(options?: ScopeOptions) {
		this[$parent] = options?.parent ?? null;
		this[$children] = [];
	}

	observables(): IterableIterator<InteropObservable> {
		return EMPTY_ITERATOR;
	}

	scopes(): IterableIterator<Scope> {
		return this[$children]?.[Symbol.iterator]() ?? EMPTY_ITERATOR;
	}

	observe(observable: InteropObservable): void {}

	dispose(): void {
		if (this[$children] === null) return; // Already disposed

		const children = this[$children];
		this[$children] = null;
		for (const child of children) {
			child.dispose();
		}

		const parentChildren = this[$parent]?.[$children];
		this[$parent] = null;
		if (parentChildren) {
			const index = parentChildren.indexOf(this);
			if (index !== -1) {
				// Move last element to index position, then pop
				parentChildren[index] = parentChildren[parentChildren.length - 1];
				parentChildren.length--;
			}
		}
	}
}
