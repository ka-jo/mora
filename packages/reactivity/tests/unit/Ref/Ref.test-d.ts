import { Ref } from "@/Ref/Ref";
import { RefInstance } from "@/Ref/types";

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
});
