import { RefOptions, RefInstance } from "@/Ref/types";
import { BaseRef } from "@/Ref/BaseRef";
import { $ref } from "@/common/symbols";

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
}
