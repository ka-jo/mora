import { ComputedRefOptions, ReadonlyRef, Ref, WritableComputedRefOptions } from "@/Ref/types";
import { ComputedRef } from "@/Ref/core/ComputedRef";

export function computed<TGet, TSet = TGet>(
	options: WritableComputedRefOptions<TGet, TSet>
): Ref<TGet, TSet>;
export function computed<TGet>(getter: () => TGet): ReadonlyRef<TGet>;
export function computed<TGet>(options: ComputedRefOptions<TGet>): ReadonlyRef<TGet>;
export function computed<TGet, TSet = TGet>(
	getterOrOptions: (() => TGet) | ComputedRefOptions<TGet> | WritableComputedRefOptions<TGet, TSet>
): Ref<TGet, TSet> {
	if (typeof getterOrOptions === "function") {
		getterOrOptions = { get: getterOrOptions };
	}
	return new ComputedRef(getterOrOptions);
}
