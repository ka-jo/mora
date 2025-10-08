import { $parent } from "@/common/symbols";
import { Scope } from "@/Scope/Scope";

export function isScope(value: any): value is Scope {
	return typeof value === "object" && value !== null && value[$parent] !== undefined;
}
