import type { Store } from "@/Store/Store";

export type StoreConstructor = {
	new <T extends Record<PropertyKey, unknown>>(object: T): Store<T>;
	<T extends Record<PropertyKey, unknown>>(object: T): Store<T>;

	isStore<T>(object: T): object is Store<T>;
};
