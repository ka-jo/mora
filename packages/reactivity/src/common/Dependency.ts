import type { Observable } from "@/common/types";
import type { Subscription } from "@/common/Subscription";
import { $flags, $value } from "@/common/symbols";
import { Flags } from "@/common/flags";

/**
 * The dependency class is used to track a dependency for computed refs so that they can determine
 * when to re-evaluate after being marked dirty. Specifically, it tracks the value of the source
 * against the value of the dependency when it was created.
 *
 * @internal
 */
export class Dependency {
	public readonly source: Observable;
	public readonly subscription: Subscription;
	private readonly value: unknown;

	public constructor(source: Observable, subscription: Subscription) {
		this.source = source;
		this.subscription = subscription;
		this.value = source[$value];
	}

	get isDirty(): boolean {
		return (this.source[$flags] & Flags.Dirty) === Flags.Dirty;
	}

	get isOutdated(): boolean {
		return !Object.is(this.source[$value], this.value);
	}
}
