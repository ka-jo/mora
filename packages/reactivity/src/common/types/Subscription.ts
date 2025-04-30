export interface Subscription {
	unsubscribe(): void;
	closed: boolean;
}
