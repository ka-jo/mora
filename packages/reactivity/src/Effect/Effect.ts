import { BaseEffect } from "@/Effect/core/BaseEffect";
import { EffectConstructor, EffectOptions } from "@/Effect/types";
import { isEffect } from "@/Effect/isEffect";
import { Scope } from "@/Scope";

export interface Effect extends Scope {
	/**
	 * Denotes if the effect will run in response to changes in dependencies.
	 * If true, the effect will trigger anytime a dependency changes.
	 * If false, the effect will only run when explicitly called with {@link EffectInstance.run | run}.
	 */
	readonly enabled: boolean;
	/**
	 * Allows the effect to automatically run in response to changes in dependencies.
	 */
	enable(): void;
	/**
	 * Prevents the effect from automatically running in response to changes in dependencies.
	 */
	disable(): void;
	/**
	 * Manually trigger the effect to run.
	 * @remarks
	 * Running the effect in this manner bypasses any dependency tracking and
	 * calls the function passed to the effect directly.
	 */
	run(): void;
}

export const Effect: EffectConstructor = Object.defineProperties(
	function Effect(fn: () => void, options?: EffectOptions) {
		return new BaseEffect(fn, options);
	},
	{
		[Symbol.hasInstance]: {
			value: isEffect,
			writable: false,
		},
		isEffect: {
			value: isEffect,
			writable: false,
		},
	}
) as any;
