import { RefOptions, Ref } from "@/Ref/types";
import { BaseRef } from "@/Ref/core/BaseRef";
import { isRef } from "@/Ref/isRef";
import { computed } from "@/Ref/computed";

const RefFactory = Object.defineProperties(
	function Ref<T>(value: T, options?: RefOptions): Ref<T, T> {
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
);
