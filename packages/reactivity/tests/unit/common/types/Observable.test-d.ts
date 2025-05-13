import { $observable } from "@/common/symbols";
import { Subscription } from "@/common/Subscription";
import { Observable } from "@/common/types";

describe("Observable", () => {
	describe("subscribe method", () => {
		it("should be a function", () => {
			expectTypeOf<Observable<number>>().toHaveProperty("subscribe").toBeFunction();
		});

		it("should return Subscription", () => {
			expectTypeOf<Observable<number>>()
				.toHaveProperty("subscribe")
				.returns.toEqualTypeOf<Subscription>();
		});

		it("should accept an observer", () => {
			expectTypeOf<Observable<number>>()
				.toHaveProperty("subscribe")
				.toBeCallableWith({
					next: (val: number) => {},
					error: (err: Error) => {},
					complete: () => {},
				});
		});

		it("should accept functions for next, error, and complete", () => {
			expectTypeOf<Observable<number>>()
				.toHaveProperty("subscribe")
				.toBeCallableWith(
					(val: number) => {},
					(err: Error) => {},
					() => {}
				);
		});

		it("should accept only next function", () => {
			expectTypeOf<Observable<number>>()
				.toHaveProperty("subscribe")
				.toBeCallableWith((val: number) => {});
		});

		it("should accept next and error functions with no function for complete", () => {
			expectTypeOf<Observable<number>>()
				.toHaveProperty("subscribe")
				.toBeCallableWith(
					(val: number) => {},
					(err: Error) => {}
				);
		});

		it("should accept next and complete functions with undefined for error", () => {
			expectTypeOf<Observable<number>>()
				.toHaveProperty("subscribe")
				.toBeCallableWith(
					(val: number) => {},
					undefined,
					() => {}
				);
		});
	});

	describe("[$Observable] method", () => {
		it("should be a function", () => {
			expectTypeOf<Observable<number>>().toHaveProperty($observable).toBeFunction();
		});

		it("should return Observable", () => {
			expectTypeOf<Observable<number>>()
				.toHaveProperty($observable)
				.returns.toEqualTypeOf<Observable<number>>();
		});
	});
});
