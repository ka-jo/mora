export interface Subscription {
	unsubscribe(): void;
	readonly closed: boolean;
}
