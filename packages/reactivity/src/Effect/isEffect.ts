import { $effect } from "@/common/symbols";
import { Effect } from "@/Effect/Effect";

export function isEffect(value: unknown): value is Effect {
	return typeof value === "object" && value !== null && (value as any)[$effect] === value;
}
