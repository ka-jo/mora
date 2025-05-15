import type { Observable, Observer } from "@/common/types";
import type { $ref, $flags, $version, $subscribers } from "@/common/symbols";
import type { Subscription } from "@/common/Subscription";
import type { Flags } from "@/common/flags";
import type { RefConstructor } from "@/Ref/types";
import { Ref } from "@/Ref/Ref";

/**
 * An instance of {@link (Ref:interface)} with no means of setting the value. {@link RefConstructor.readonly | Ref.readonly}
 * returns a ReadonlyRef as does {@link RefConstructor.computed | Ref.computed} if no setter is provided.
 *
 * @public
 */
export interface ReadonlyRef<TGet> extends Ref<TGet> {
	/**
	 * The ref symbol is used internally to identify ref instances. It is not intended
	 * to be used by consumers but is included here to act as a type brand.
	 *
	 * @internal
	 */
	[$ref]: ReadonlyRef<TGet>;
	/**
	 * The set method should never be called on a ReadonlyRef. Doing so will throw a TypeError
	 */
	set: never;
	/**
	 * A function that returns the ref instance itself. This is required when
	 * implementing custom observables to ensure interop with other observable libraries.
	 *
	 * @public
	 */
	[Symbol.observable](): ReadonlyRef<TGet>;
}
