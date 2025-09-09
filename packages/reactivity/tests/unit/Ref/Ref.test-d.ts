import { Subscription } from "@/common/Subscription";
import { $observable } from "@/common/symbols";
import { Observable } from "@/common/types";
import { Ref } from "@/Ref";
import { ReadonlyRef } from "@/Ref/types";

describe("Ref constructor", () => {
	it("should be a function", () => {
		expectTypeOf(Ref).toBeFunction();
	});

	it("should accept a value", () => {
		expectTypeOf(Ref).toBeCallableWith(0);
	});

	it("should accept a value and an options object", () => {
		expectTypeOf(Ref).toBeCallableWith(0, {});
	});

	it("should return a Ref", () => {
		expectTypeOf(Ref).returns.toEqualTypeOf<Ref<unknown>>();
	});

	describe("static isRef method", () => {
		it("should be a function", () => {
			expectTypeOf(Ref.isRef).toBeFunction();
		});

		it("should accept a value", () => {
			expectTypeOf(Ref.isRef).toBeCallableWith(0);
		});

		it("should return a boolean", () => {
			expectTypeOf(Ref.isRef).returns.toEqualTypeOf<boolean>();
		});

		it("should guard Ref", () => {
			expectTypeOf(Ref.isRef).guards.toEqualTypeOf<Ref<unknown>>();
		});
	});

	describe("static computed method", () => {
		it("should be a function", () => {
			expectTypeOf(Ref.computed).toBeFunction();
		});

		it("should accept a getter function", () => {
			expectTypeOf(Ref.computed).toBeCallableWith(() => 0);
		});

		it("should accept an options object", () => {
			expectTypeOf(Ref.computed).toBeCallableWith({
				get: () => 0,
				set: (value: unknown) => {},
			});
		});

		it("should return a ReadonlyRef if no setter is provided", () => {
			expectTypeOf(Ref.computed(() => 0)).toEqualTypeOf<ReadonlyRef<number>>();

			expectTypeOf(Ref.computed({ get: () => 0 })).toEqualTypeOf<ReadonlyRef<number>>();
		});

		it("should return a Ref if a setter is provided", () => {
			expectTypeOf(
				Ref.computed({
					get: () => 0,
					set: (value) => {},
				})
			).toEqualTypeOf<Ref<number, number>>();
		});
	});
});

describe("Ref type", () => {
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

		it("should return a boolean", () => {
			expectTypeOf<Ref<number>>().toHaveProperty("set").returns.toEqualTypeOf<boolean>();
		});

		it("should accept one argument", () => {
			expectTypeOf<Ref<number>>()
				.toHaveProperty("set")
				.parameters.toEqualTypeOf<[number | Ref<number>]>();
		});
	});

	describe("subscribe method", () => {
		it("should be a function", () => {
			expectTypeOf<Ref<number>>().toHaveProperty("subscribe").toBeFunction();
		});

		it("should return Subscription", () => {
			expectTypeOf<Ref<number>>().toHaveProperty("subscribe").returns.toEqualTypeOf<Subscription>();
		});

		it("should accept an observer", () => {
			expectTypeOf<Ref<number>>()
				.toHaveProperty("subscribe")
				.toBeCallableWith({
					next: (val: number) => {},
					error: (err: Error) => {},
					complete: () => {},
				});
		});

		it("should accept functions for next, error, and complete", () => {
			expectTypeOf<Ref<number>>()
				.toHaveProperty("subscribe")
				.toBeCallableWith(
					(val: number) => {},
					(err: Error) => {},
					() => {}
				);
		});

		it("should accept only next function", () => {
			expectTypeOf<Ref<number>>()
				.toHaveProperty("subscribe")
				.toBeCallableWith((val: number) => {});
		});

		it("should accept next and error functions with no function for complete", () => {
			expectTypeOf<Ref<number>>()
				.toHaveProperty("subscribe")
				.toBeCallableWith(
					(val: number) => {},
					(err: Error) => {}
				);
		});

		it("should accept next and complete functions with undefined for error", () => {
			expectTypeOf<Ref<number>>()
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
			expectTypeOf<Ref<number>>().toHaveProperty($observable).toBeFunction();
		});

		it("should return Observable", () => {
			expectTypeOf<Ref<number>>().toHaveProperty($observable).returns.toEqualTypeOf<Ref<number>>();
		});
	});
});
