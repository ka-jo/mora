import { Observable } from "@/common/types";
import { $children, $dependencies, $index, $parent } from "@/common/symbols";
import type { ScopeOptions } from "@/Scope/types";
import type { Scope } from "@/Scope/Scope";

/**
 * @internal
 */
export class BaseScope implements Scope {
	declare [$parent]: Scope | null;
	declare [$index]: number;
	declare [$children]: Scope[] | null;
	declare [$dependencies]: Set<Observable> | null;

	constructor(options?: ScopeOptions) {
		if (options?.scope) {
			const parentChildren = options.scope[$children];
			if (parentChildren === null) {
				throw new Error("Cannot add scope to disposed parent");
			}
			this[$parent] = options.scope;
			this[$index] = parentChildren.length;
			parentChildren.push(this);
		} else {
			this[$parent] = null;
		}
		this[$children] = [];
		this[$dependencies] = new Set();
	}

	*observables(): IterableIterator<Observable> {
		if (this[$dependencies]) yield* this[$dependencies];
	}

	*scopes(): IterableIterator<Scope> {
		if (this[$children]) yield* this[$children];
	}

	observe(observable: Observable): void {
		if (this[$children] === null) return; // Already disposed

		this[$dependencies]!.add(observable);
	}

	dispose(): void {
		if (this[$children] === null) return; // Already disposed

		const children = this[$children];
		this[$dependencies] = null;
		this[$children] = null; // Mark as disposed

		for (const child of children) {
			child.dispose();
		}

		const parent = this[$parent];
		this[$parent] = null;
		if (parent) {
			const parentChildren = parent[$children];
			if (parentChildren) {
				const index = this[$index];
				const lastChild = parentChildren[parentChildren.length - 1];
				parentChildren[index] = lastChild;
				lastChild[$index] = index;
				parentChildren.pop();
			}
		}
	}
}
