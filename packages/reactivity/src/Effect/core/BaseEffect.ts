import { Flags } from "@/common/flags";
import { $compute, $flags, $dependencies, $observer, $value } from "@/common/symbols";
import {
	popTrackingContext,
	pushTrackingContext,
	TrackingContext,
} from "@/common/tracking-context";
import { Observable, Observer } from "@/common/types";
import { Subscription } from "@/common/Subscription";
import { EffectInstance } from "@/Effect/types";

export class BaseEffect implements EffectInstance {
	[$flags]: number = 0;
	[$dependencies]: Array<Subscription> = [];
	[$observer]: Partial<Observer>;
	[$compute]: () => void;

	run: () => void;

	constructor(fn: () => void) {
		this.run = fn;
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

		BaseEffect.unsubscribeFromDependencies(effect);

		pushTrackingContext();
		BaseEffect.tryRun(effect);
		effect[$dependencies] = BaseEffect.initDependencies(effect[$observer], popTrackingContext()!);
	}

	private static onDependencyChange(effect: BaseEffect): void {
		if (effect[$flags] & Flags.Queued) return;

		effect[$flags] |= Flags.Queued;
		queueMicrotask(effect[$compute]);
	}

	private static unsubscribeFromDependencies(effect: BaseEffect): void {
		for (const dep of effect[$dependencies]) {
			dep.unsubscribe();
		}
	}

	private static tryRun(effect: BaseEffect): void {
		try {
			effect.run();
		} catch (e) {
			if (e instanceof Error === false) e = new Error(String(e));

			throw e;
		}
	}

	private static initDependencies(
		observer: Partial<Observer>,
		trackingContext: TrackingContext
	): Array<Subscription> {
		const dependencies = new Array<Subscription>();
		let i = 0;
		for (const { source, property } of trackingContext) {
			// This isn't a ref access, so we don't care about it
			if (property !== $value) continue;

			dependencies[i++] = source.subscribe(observer);
		}
		return dependencies;
	}
}
