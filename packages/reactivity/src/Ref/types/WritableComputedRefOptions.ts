import { ComputedRefOptions } from "@/Ref/types";

export interface WritableComputedRefOptions<TGet, TSet = TGet>
	extends ComputedRefOptions<TGet> {
	set: (value: TSet) => void;
}
