import { ComputedRef } from "@/Ref/core/ComputedRef";
import { Ref } from "@/Ref";
import { Observable } from "@/common/types";
import { $observable } from "@/common/symbols";
import { Subscription } from "@/common/Subscription";

describe("Ref", () => {
	describe("constructor", () => {
		it("should be callable with new keyword", () => {
			expect(() => {
				//@ts-ignore: TypeScript doesn't like this, and to be honest, I'm not convinced we should
				// encourage using 'new', but I think it's worth documenting the behavior
				const ref = new Ref(0);
				expect(ref).toBeRef();
			}).not.toThrowError();
		});

		it("should be callable without new keyword", () => {
			expect(() => {
				const ref = Ref(0);
				expect(ref).toBeRef();
			}).not.toThrowError();
		});
	});

	describe("static isRef method", () => {
		it("should return true for Ref instance", () => {
			const ref = Ref(0);
			expect(Ref.isRef(ref)).toBe(true);
		});

		it("should return false for non-Ref instance", () => {
			const notRef = { get: () => {}, set: () => {} };
			expect(Ref.isRef(notRef)).toBe(false);
		});
	});

	describe("static computed method", () => {
		it("should be callable with getter function", () => {
			expect(() => {
				const computedRef = Ref.computed(() => 42);
				expect(computedRef).toBeRef();
			}).not.toThrowError();
		});

		it("should be callable with options object", () => {
			expect(() => {
				const computedRef = Ref.computed({
					get: () => 42,
					set: (value) => {},
				});
				expect(computedRef).toBeRef();
			}).not.toThrowError();
		});

		it("should return a ComputedRef instance", () => {
			const computedRef = Ref.computed(() => 42);
			expect(computedRef).toBeInstanceOf(ComputedRef);
		});
	});

	it("should support instanceof operator", () => {
		const ref = Ref(0);
		expect(ref).toBeInstanceOf(Ref);
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

		it("should return Subscription", () => {
			expectTypeOf<Ref<number>>().toHaveProperty("subscribe").returns.toEqualTypeOf<Subscription>();
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
