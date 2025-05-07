import { Ref } from "@/Ref/Ref";
import { ReadonlyRefInstance, RefInstance } from "@/Ref/types";

describe("Ref", () => {
	it("should be a function", () => {
		expectTypeOf(Ref).toBeFunction();
	});

	it("should accept a value", () => {
		expectTypeOf(Ref).toBeCallableWith(0);
	});

	it("should accept a value and an options object", () => {
		expectTypeOf(Ref).toBeCallableWith(0, {});
	});

	it("should return a RefInstance", () => {
		expectTypeOf(Ref).returns.toEqualTypeOf<RefInstance<unknown>>();
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

		it("should guard RefInstance", () => {
			expectTypeOf(Ref.isRef).guards.toEqualTypeOf<RefInstance<unknown>>();
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

		it("should return a ReadonlyRefInstance if no setter is provided", () => {
			expectTypeOf(Ref.computed(() => 0)).toEqualTypeOf<
				ReadonlyRefInstance<number>
			>();

			expectTypeOf(Ref.computed({ get: () => 0 })).toEqualTypeOf<
				ReadonlyRefInstance<number>
			>();
		});

		it("should return a RefInstance if a setter is provided", () => {
			expectTypeOf(
				Ref.computed({
					get: () => 0,
					set: (value) => {},
				})
			).toEqualTypeOf<RefInstance<number, number>>();
		});
	});
});
