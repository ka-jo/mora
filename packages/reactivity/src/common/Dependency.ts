import { $flags, $version } from "@/common/symbols";
import { Flags } from "@/common/flags";
import { Observable, Subscription } from "@/common/types";

export class Dependency {
	public readonly source: Observable;
	public readonly subscription: Subscription;
	public readonly version: number;

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
