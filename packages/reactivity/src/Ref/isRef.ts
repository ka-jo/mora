import { $ref } from "@/common/symbols";
import { Ref } from "@/Ref/types";

export function isRef<T>(value: Ref<T> | any): value is Ref<T> {
	return value[$ref] === value;
}
