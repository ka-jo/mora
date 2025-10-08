import { $ref } from "@/common/symbols";
import type { RefConstructor } from "@/Ref/types";
import type { Ref } from "@/Ref/Ref";

export const isRef: RefConstructor["isRef"] = function isRef<T>(
	value: Ref<T> | any
): value is Ref<T> {
	return typeof value === "object" && value !== null && value[$ref] === value;
};
