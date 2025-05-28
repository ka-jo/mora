import type { Store } from "@/Store/Store";

export type StoreConstructor = {
	new <T extends object>(object: T): Store<T>;
	<T extends object>(object: T): Store<T>;

	isStore<T>(object: T): object is Store<T>;
};
