import { Observer, Observable } from "@/common/types";
import {
	$children,
	$flags,
	$parent,
	$dependencies,
	$subscribers,
	$observable,
	$value,
} from "@/common/symbols";
import { Flags } from "@/common/flags";
import { Subscription } from "@/common/Subscription";
import { Dependency } from "@/common/Dependency";
import { createObserver } from "@/common/util";
import type { ScopeOptions } from "@/Scope/types";
import type { Scope } from "@/Scope/Scope";
import { currentScope } from "@/common/current-scope";

/**
 * @internal
 */
export class BaseScope implements Scope {
	declare [$parent]: Scope | undefined;
	declare [$children]: Scope[];
	declare [$flags]: number;
	declare [$dependencies]: Dependency[];
	declare [$subscribers]: Subscription | null;
	declare [$value]: void;

	declare dispose: (() => void) & Observable<void>;

	constructor(options?: ScopeOptions) {}

	observe(observable: Observable): void {}

	private static dispose(scope: BaseScope): void {}
}
