export interface Observer<T> {
	next(value: T): void;
	error(err: Error): void;
	complete(): void;
}
