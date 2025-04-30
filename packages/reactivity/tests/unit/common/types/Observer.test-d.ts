import { Observer } from "@/common/types";

describe("Observer", () => {
	describe("next method", () => {
		it("should be a function", () => {
			expectTypeOf<Observer<number>>().toHaveProperty("next").toBeFunction();
		});

		it("should return void", () => {
			expectTypeOf<Observer<number>>()
				.toHaveProperty("next")
				.returns.toEqualTypeOf<void>();
		});

		it("should accept one argument of the correct type", () => {
			expectTypeOf<Observer<number>>()
				.toHaveProperty("next")
				.parameters.toEqualTypeOf<[number]>();
		});
	});

	describe("error method", () => {
		it("should be a function", () => {
			expectTypeOf<Observer<number>>().toHaveProperty("error").toBeFunction();
		});

		it("should return void", () => {
			expectTypeOf<Observer<number>>()
				.toHaveProperty("error")
				.returns.toEqualTypeOf<void>();
		});

		it("should accept one argument of type Error", () => {
			expectTypeOf<Observer<number>>()
				.toHaveProperty("error")
				.parameters.toEqualTypeOf<[Error]>();
		});
	});

	describe("complete method", () => {
		it("should be a function", () => {
			expectTypeOf<Observer<number>>()
				.toHaveProperty("complete")
				.toBeFunction();
		});

		it("should return void", () => {
			expectTypeOf<Observer<number>>()
				.toHaveProperty("complete")
				.returns.toEqualTypeOf<void>();
		});

		it("should accept no arguments", () => {
			expectTypeOf<Observer<number>>()
				.toHaveProperty("complete")
				.parameters.toEqualTypeOf<[]>();
		});
	});
});
