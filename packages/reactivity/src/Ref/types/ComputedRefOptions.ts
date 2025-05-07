import { RefOptions } from "@/Ref/types";

export interface ComputedRefOptions<TGet> extends RefOptions {
	get: () => TGet;
}
