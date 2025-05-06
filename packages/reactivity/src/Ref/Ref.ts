import { $ref } from "@/common/symbols";
import { RefOptions, RefInstance, ComputedRefOptions } from "@/Ref/types";
import { BaseRef } from "@/Ref/BaseRef";
import { ComputedRef } from "@/Ref/ComputedRef";

export function Ref<T>(value: T, options?: RefOptions): RefInstance<T, T> {
	return new BaseRef(value, options);
}

Object.defineProperties(Ref, {
	[Symbol.hasInstance]: {
		value: (instance: unknown): boolean => Ref.isRef(instance),
		writable: false,
	},
});

export namespace Ref {
	export function isRef<T>(
		value: RefInstance<T> | any
	): value is RefInstance<T> {
		return value[$ref] === value;
	}

	export function computed<TGet, TSet = TGet>(
		getterOrOptions: (() => TGet) | ComputedRefOptions<TGet, TSet>
	): ComputedRef<TGet, TSet> {
		if (typeof getterOrOptions === "function") {
			getterOrOptions = { get: getterOrOptions };
		}
		return new ComputedRef(getterOrOptions as ComputedRefOptions<TGet, TSet>);
	}
}
