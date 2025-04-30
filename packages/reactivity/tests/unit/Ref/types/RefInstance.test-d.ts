import { $Observable } from "@/common/symbols";
import { Observable } from "@/common/types";
import { RefInstance, RefSubscription } from "@/Ref/types";

describe("RefInstance", () => {
	it("should extend Observable", () => {
		expectTypeOf<RefInstance<number>>().toExtend<Observable<number>>();
	});

	describe("TSet type parameter", () => {
		it("should default to TGet", () => {
			const ref: RefInstance<number, number> = {} as any;
			expectTypeOf(ref).toEqualTypeOf<RefInstance<number, number>>();
		});
	});

	describe("get method", () => {
		it("should be a function", () => {
			expectTypeOf<RefInstance<number>>().toHaveProperty("get").toBeFunction();
		});

		it("should return the correct type", () => {
			expectTypeOf<RefInstance<number>>()
				.toHaveProperty("get")
				.returns.toEqualTypeOf<number>();
		});

		it("should accept no arguments", () => {
			expectTypeOf<RefInstance<any>>()
				.toHaveProperty("get")
				.parameters.toEqualTypeOf<[]>();
		});
	});

	describe("set method", () => {
		it("should be a function", () => {
			expectTypeOf<RefInstance<number>>().toHaveProperty("set").toBeFunction();
		});

		it("should return void", () => {
			expectTypeOf<RefInstance<number>>()
				.toHaveProperty("set")
				.returns.toEqualTypeOf<void>();
		});

		it("should accept one argument", () => {
			expectTypeOf<RefInstance<number>>()
				.toHaveProperty("set")
				.parameters.toEqualTypeOf<[number]>();
		});
	});

	describe("subscribe method", () => {
		it("should be a function", () => {
			expectTypeOf<RefInstance<number>>()
				.toHaveProperty("subscribe")
				.toBeFunction();
		});

		it("should return RefSubscription", () => {
			expectTypeOf<RefInstance<number>>()
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
			expectTypeOf<Observable<number>>()
				.toHaveProperty($Observable)
				.toBeFunction();
		});

		it("should return Observable", () => {
			expectTypeOf<Observable<number>>()
				.toHaveProperty($Observable)
				.returns.toEqualTypeOf<Observable<number>>();
		});
	});
});
