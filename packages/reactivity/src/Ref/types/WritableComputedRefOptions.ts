import type { ComputedRefOptions } from "@/Ref/types";
import type { Ref } from "@/Ref/Ref";

/**
 * The options used to create a writable computed ref
 *
 * @public
 */
export interface WritableComputedRefOptions<TGet, TSet = TGet> extends ComputedRefOptions<TGet> {
	/**
	 * A function that will be called when the computed ref's {@link (Ref:interface).set | set} method is
	 * called, receiving the value passed to set as the argument
	 */
	set: (value: TSet) => void;
}
