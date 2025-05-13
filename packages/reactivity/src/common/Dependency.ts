import type { Observable } from "@/common/types";
import type { Subscription } from "@/common/Subscription";
import { $flags, $version } from "@/common/symbols";
import { Flags } from "@/common/flags";

/**
 * The dependency class is used to track a dependency for computed refs so that they can determine
 * when to re-evaluate after being marked dirty. Specifically, it trackes the version of the source
 * against the version of the dependency when it was created.
 *
 * @internal
 */
export class Dependency {
	public readonly source: Observable;
	public readonly subscription: Subscription;
	private readonly version: number;

	public constructor(source: Observable, subscription: Subscription) {
		this.source = source;
		this.subscription = subscription;
		this.version = source[$version];
	}

	get isDirty(): boolean {
		return (this.source[$flags] & Flags.Dirty) === Flags.Dirty;
	}

	get isOutdated(): boolean {
		return this.source[$version] !== this.version;
	}
}
