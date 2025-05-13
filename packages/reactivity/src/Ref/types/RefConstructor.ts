import type {
	ComputedRefOptions,
	WritableComputedRefOptions,
	ReadonlyRef,
	RefOptions,
} from "@/Ref/types";
import type { Ref } from "@/Ref/Ref";

/**
 * The constructor for creating a {@link (Ref:interface)} instance. If no value is provided,
 * the ref will be initialized with `undefined` and the type will be `undefined | T`.
 *
 * @remarks
 * Supports constructing with or without the `new` keyword. There is no difference
 * between the two, and documentation will default to no `new` keyword.
 *
 * @public
 */
export interface RefConstructor {
	<T>(_?: undefined, options?: RefOptions): Ref<undefined | T>;
	<T>(value: T, options?: RefOptions): Ref<T>;
	new <T>(_?: undefined, options?: RefOptions): Ref<undefined | T>;
	new <T>(value: T, options?: RefOptions): Ref<T>;

	/**
	 * Type guard that checks if a value is a {@link (Ref:interface)}
	 *
	 * @param value - the value to check
	 * @returns `true` if the value is a {@link (Ref:interface)}, `false` otherwise
	 *
	 * @public
	 */
	isRef<T>(value: Ref<T> | unknown): value is Ref<T>;

	/**
	 * Creates a computed ref using the provided options
	 *
	 * @param options - a {@link WritableComputedRefOptions} object
	 * @returns a {@link (Ref:interface)} instance
	 *
	 * @public
	 */
	computed<TGet, TSet = TGet>(options: WritableComputedRefOptions<TGet, TSet>): Ref<TGet, TSet>;
	/**
	 * Creates a readonly computed ref using the provided getter
	 *
	 * @param getter - a function that returns the value of the computed ref
	 * @returns a {@link ReadonlyRef} instance
	 *
	 * @public
	 */
	computed<TGet>(getter: () => TGet): ReadonlyRef<TGet>;
	/**
	 * Creates a readonly computed ref using the provided options
	 *
	 * @param options - a {@link ComputedRefOptions} object
	 * @returns a {@link ReadonlyRef} instance
	 *
	 * @public
	 */
	computed<TGet>(options: ComputedRefOptions<TGet>): ReadonlyRef<TGet>;
}
