import type {
	ComputedRefOptions,
	ReadonlyRef,
	RefConstructor,
	WritableComputedRefOptions,
} from "@/Ref/types";
import type { Ref } from "@/Ref/Ref";
import { ComputedRef } from "@/Ref/core/ComputedRef";

export const computed: RefConstructor["computed"] = function computed<TGet, TSet = TGet>(
	getterOrOptions: (() => TGet) | ComputedRefOptions<TGet> | WritableComputedRefOptions<TGet, TSet>
): Ref<TGet, TSet> {
	if (typeof getterOrOptions === "function") {
		getterOrOptions = { get: getterOrOptions };
	}
	return new ComputedRef(getterOrOptions);
} as RefConstructor["computed"];
