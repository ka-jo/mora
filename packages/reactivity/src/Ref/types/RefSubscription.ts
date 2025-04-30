import { Subscription } from "@/common/types";

export interface RefSubscription extends Subscription {
	readonly isEnabled: boolean;
	enable(): void;
	disable(): void;
}
