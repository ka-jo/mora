import { EffectInstance } from "@/Effect/types";
import { BaseEffect } from "@/Effect/core/BaseEffect";

export function Effect(fn: () => void): EffectInstance {
	return new BaseEffect(fn);
}
