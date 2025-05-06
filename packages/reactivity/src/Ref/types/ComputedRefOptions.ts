import { RefOptions } from "@/Ref/types";

export interface ComputedRefOptions<TGet, TSet = TGet> extends RefOptions {
	get: () => TGet;
	set?: (value: TSet) => void;
}
