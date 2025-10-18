import { Flags } from "@/common/flags";
import {
	$compute,
	$flags,
	$dependencies,
	$observer,
	$parent,
	$children,
	$index,
	$observable,
} from "@/common/symbols";
import { Observable, Observer } from "@/common/types";
import { EffectInstance } from "@/Effect/types";
import { Subscription } from "@/common/Subscription";
import { disposeScope, Scope } from "@/Scope";
import {
	createDependency,
	currentScope,
	dependencyIndex,
	removeDependencies,
	reuseDependency,
	setActiveScope,
} from "@/common/current-scope";
import { createObserver } from "@/common/util";
import { create } from "domain";

export class BaseEffect implements EffectInstance {
	declare [$flags]: number;
	declare [$dependencies]: Subscription[];
	declare [$observer]: Observer;
	declare [$parent]: Scope | null;
	declare [$children]: Array<Scope> | null;
	declare [$index]: number;

	declare run: () => void;

	constructor(fn: () => void) {
		this.run = fn;
		this[$flags] = Flags.Enabled;
		this[$dependencies] = [];
		this[$observer] = createObserver({
			next: BaseEffect.onDependencyChange.bind(BaseEffect, this),
		});

		this[$compute]();
	}

	get enabled(): boolean {
		return (this[$flags] & Flags.Enabled) > 0;
	}

	enable(): void {
		this[$flags] |= Flags.Enabled;
	}

	disable(): void {
		this[$flags] &= ~Flags.Enabled;
	}

	*observables(): IterableIterator<Observable> {
		if (this[$flags] & Flags.Aborted) return;

		for (const subscription of this[$dependencies]) {
			yield subscription[$observable];
		}
	}

	*scopes(): IterableIterator<Scope> {
		if (this[$children]) yield* this[$children];
	}

	observe(observable: Observable): void {
		if (currentScope !== this || this[$flags] & Flags.Aborted) return;

		const existingDependency = this[$dependencies][dependencyIndex];
		if (existingDependency) {
			if (existingDependency[$observable] === observable) {
				return reuseDependency(existingDependency);
			} else {
				removeDependencies(this, dependencyIndex);
			}
		}
		createDependency(this, observable);
	}

	dispose(): void {
		if (this[$flags] & Flags.Aborted) return;

		this[$flags] = Flags.Aborted;

		disposeScope(this);

		removeDependencies(this);

		this[$dependencies] = null as any;
		this[$observer] = null as any;
	}

	[$compute](): void {
		this[$flags] &= ~Flags.Queued;

		if (!(this[$flags] & Flags.Enabled)) return;

		const prevScope = currentScope;
		const prevDependencyIndex = dependencyIndex;

		setActiveScope(this);

		try {
			this.run();

			if (this[$dependencies].length > dependencyIndex) {
				// remove any stale dependencies
				removeDependencies(this, dependencyIndex);
			}
		} catch (e) {
			if (e instanceof Error === false) e = new Error(String(e));

			throw e;
		} finally {
			setActiveScope(prevScope, prevDependencyIndex);
		}
	}

	private static onDependencyChange(effect: BaseEffect): void {
		if (effect[$flags] & Flags.Queued) return;

		effect[$flags] |= Flags.Queued;
		queueMicrotask(effect[$compute]);
	}
}
