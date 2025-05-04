export interface Observer<T = unknown> {
	next(value: T): void;
	error(err: Error): void;
	complete(): void;
}
