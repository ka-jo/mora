import { ComputedRefOptions, Ref, RefConstructor, WritableComputedRefOptions } from "@/Ref/types";
import { ComputedRef } from "@/Ref/core/ComputedRef";

export const computed: RefConstructor["computed"] = function computed<TGet, TSet = TGet>(
	getterOrOptions: (() => TGet) | ComputedRefOptions<TGet> | WritableComputedRefOptions<TGet, TSet>
): Ref<TGet, TSet> {
	if (typeof getterOrOptions === "function") {
		getterOrOptions = { get: getterOrOptions };
	}
	return new ComputedRef(getterOrOptions);
};
