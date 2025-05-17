import type { Store } from "@/Store/Store";
import type { StoreConstructor } from "@/Store/types/StoreConstructor";
import { $store } from "@/common/symbols";

export const isStore: StoreConstructor["isStore"] = function isStore<T>(
	object: T
): object is Store<T> {
	//@ts-expect-error: TypeScript doesn't think T can be indexed with $store
	return object && object[$store] !== undefined;
};
