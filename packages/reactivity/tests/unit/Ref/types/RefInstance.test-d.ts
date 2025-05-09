import { $observable } from "@/common/symbols";
import { Observable } from "@/common/types";
import { Ref } from "@/Ref/types";
import { RefSubscription } from "@/Ref/core/RefSubscription";

describe("Ref", () => {
	it("should extend Observable", () => {
		expectTypeOf<Ref<number>>().toExtend<Observable<number>>();
	});

	describe("TSet type parameter", () => {
		it("should default to TGet", () => {
			const ref: Ref<number, number> = {} as any;
			expectTypeOf(ref).toEqualTypeOf<Ref<number, number>>();
		});
	});

	describe("get method", () => {
		it("should be a function", () => {
			expectTypeOf<Ref<number>>().toHaveProperty("get").toBeFunction();
		});

		it("should return the correct type", () => {
			expectTypeOf<Ref<number>>().toHaveProperty("get").returns.toEqualTypeOf<number>();
		});

		it("should accept no arguments", () => {
			expectTypeOf<Ref<any>>().toHaveProperty("get").parameters.toEqualTypeOf<[]>();
		});
	});

	describe("set method", () => {
		it("should be a function", () => {
			expectTypeOf<Ref<number>>().toHaveProperty("set").toBeFunction();
		});

		it("should return void", () => {
			expectTypeOf<Ref<number>>().toHaveProperty("set").returns.toEqualTypeOf<void>();
		});

		it("should accept one argument", () => {
			expectTypeOf<Ref<number>>().toHaveProperty("set").parameters.toEqualTypeOf<[number]>();
		});
	});

	describe("subscribe method", () => {
		it("should be a function", () => {
			expectTypeOf<Ref<number>>().toHaveProperty("subscribe").toBeFunction();
		});

		it("should return RefSubscription", () => {
			expectTypeOf<Ref<number>>()
				.toHaveProperty("subscribe")
				.returns.toEqualTypeOf<RefSubscription>();
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
