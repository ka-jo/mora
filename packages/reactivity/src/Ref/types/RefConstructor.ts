import { ComputedRefOptions, Ref, WritableComputedRefOptions, ReadonlyRef } from "@/Ref/types";

/**
 * The constructor for creating a {@link Ref} instance. If no value is provided,
 * the ref will be initialized with `undefined` and the type will be `undefined | T`.
 *
 * @remarks
 * Supports constructing with or without the `new` keyword. There is no difference
 * between the two, and documentation will default to no `new` keyword.
 *
 * @public
 */
export interface RefConstructor {
	<T>(): Ref<undefined | T>;
	<T>(value: T): Ref<T>;
	new <T>(): Ref<undefined | T>;
	new <T>(value: T): Ref<T>;

	/**
	 * Type guard that checks if a value is a {@link Ref}
	 *
	 * @param value
	 * @returns `true` if the value is a {@link Ref}, `false` otherwise
	 *
	 * @public
	 */
	isRef<T>(value: Ref<T> | T): value is Ref<T>;

	/**
	 * Creates a computed ref using the provided options
	 *
	 * @param options a {@link WritableComputedRefOptions} object
	 * @returns a {@link Ref} instance
	 *
	 * @public
	 */
	computed<TGet, TSet>(options: WritableComputedRefOptions<TGet, TSet>): Ref<TGet, TSet>;
	/**
	 * Creates a readonly computed ref using the provided getter
	 *
	 * @param getter a function that returns the value of the computed ref
	 * @returns a {@link ReadonlyRef} instance
	 *
	 * @public
	 */
	computed<TGet>(getter: () => TGet): ReadonlyRef<TGet>;
	/**
	 * Creates a readonly computed ref using the provided options
	 *
	 * @param options a {@link ComputedRefOptions} object
	 * @returns a {@link ReadonlyRef} instance
	 *
	 * @public
	 */
	computed<TGet>(options: ComputedRefOptions<TGet>): ReadonlyRef<TGet>;
}
