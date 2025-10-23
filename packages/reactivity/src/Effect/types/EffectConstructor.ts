import { EffectOptions } from "@/Effect/types";
import { Effect } from "@/Effect/Effect";

export interface EffectConstructor {
	(fn: () => void, options?: EffectOptions): EffectConstructor;
	new (fn: () => void, options?: EffectOptions): Effect;
	/**
	 * Type guard to check if a value is an Effect
	 * @param value
	 */
	isEffect(value: unknown): value is Effect;
}
