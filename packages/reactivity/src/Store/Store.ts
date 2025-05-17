import { $store } from "@/common/symbols";
import { BaseStore } from "@/Store/core/BaseStore";
import { StoreConstructor } from "@/Store/types/StoreConstructor";
import { isStore } from "@/Store/isStore";

/**
 * @public
 */
export type Store<T> = T & {
	[$store]: Store<T>;
};

/**
 * @public
 */
export const Store: StoreConstructor = Object.defineProperties(
	function Store<T extends Record<PropertyKey, unknown>>(object: T): Store<T> {
		return BaseStore.create(object);
	},
	{
		[Symbol.hasInstance]: {
			value: (object: unknown) => isStore(object),
			writable: false,
		},
		isStore: {
			value: isStore,
			writable: false,
		},
	}
) as StoreConstructor;
