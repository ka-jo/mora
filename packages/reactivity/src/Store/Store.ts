import { $store } from "@/common/symbols";
import { BaseStore } from "@/Store/core/BaseStore";

export function Store<T extends Record<PropertyKey, unknown>>(object: T): Store<T> {
	return BaseStore.create(object);
}

export type Store<T> = T & {
	[$store]: Store<T>;
};
