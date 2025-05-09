import { Ref } from "@/Ref";
import { ReadonlyRef, Ref } from "@/Ref/types";

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
