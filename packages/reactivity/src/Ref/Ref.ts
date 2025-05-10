import { RefOptions, RefConstructor } from "@/Ref/types";
import { BaseRef } from "@/Ref/core/BaseRef";
import { isRef } from "@/Ref/isRef";
import { computed } from "@/Ref/computed";

export const Ref: RefConstructor = Object.defineProperties(
	function Ref<T>(value?: T, options?: RefOptions) {
		return new BaseRef(value, options);
	},
	{
		[Symbol.hasInstance]: {
			value: (instance: unknown): boolean => isRef(instance),
			writable: false,
		},
		isRef: {
			value: isRef,
			writable: false,
		},
		computed: {
			value: computed,
			writable: false,
		},
	}
) as any;
