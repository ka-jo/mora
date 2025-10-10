import { Flags } from "@/common/flags";
import { $compute, $flags, $dependencies, $observer } from "@/common/symbols";
import { popTrackingContext, pushTrackingContext } from "@/common/tracking-context";
import { Observer } from "@/common/types";
import { EffectInstance } from "@/Effect/types";
import type { Dependency } from "@/common/Dependency";

export class BaseEffect implements EffectInstance {
	[$flags]: number = 0;
	[$dependencies]: Dependency[];
	[$observer]: Partial<Observer>;
	[$compute]: () => void;

	run: () => void;

	constructor(fn: () => void) {
		this.run = fn;
		this[$dependencies] = [];
		this[$observer] = {
			next: BaseEffect.onDependencyChange.bind(BaseEffect, this),
		};
		this[$compute] = BaseEffect.compute.bind(BaseEffect, this);

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

	private static compute(effect: BaseEffect): void {
		effect[$flags] &= ~Flags.Queued;

		if (!(effect[$flags] & Flags.Enabled)) return;

		for (const dep of effect[$dependencies]) {
			dep.subscription.unsubscribe();
		}

		// Dependencies are created during tracking
		pushTrackingContext(effect[$observer]);
		BaseEffect.tryRun(effect);
		effect[$dependencies] = popTrackingContext()!;
	}

	private static onDependencyChange(effect: BaseEffect): void {
		if (effect[$flags] & Flags.Queued) return;

		effect[$flags] |= Flags.Queued;
		queueMicrotask(effect[$compute]);
	}

	private static tryRun(effect: BaseEffect): void {
		try {
			effect.run();
		} catch (e) {
			if (e instanceof Error === false) e = new Error(String(e));

			throw e;
		}
	}
}
