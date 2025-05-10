import { $ref } from "@/common/symbols";
import { Ref, RefConstructor } from "@/Ref/types";

export const isRef: RefConstructor["isRef"] = function isRef<T>(
	value: Ref<T> | any
): value is Ref<T> {
	return value[$ref] === value;
};
