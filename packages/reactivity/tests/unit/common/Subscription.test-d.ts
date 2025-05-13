import { Subscription } from "@/common/Subscription";

describe("Subscription", () => {
	describe("unsubscribe method", () => {
		it("should be a function", () => {
			expectTypeOf<Subscription>().toHaveProperty("unsubscribe").toBeFunction();
		});

		it("should return void", () => {
			expectTypeOf<Subscription>().toHaveProperty("unsubscribe").returns.toEqualTypeOf<void>();
		});

		it("should accept no arguments", () => {
			expectTypeOf<Subscription>().toHaveProperty("unsubscribe").parameters.toEqualTypeOf<[]>();
		});
	});

	describe("closed property", () => {
		it("should be a boolean", () => {
			expectTypeOf<Subscription>().toHaveProperty("closed").toEqualTypeOf<boolean>();
		});

		it("should be readonly", () => {
			const subscription: Subscription = {} as any;
			// @ts-expect-error: should not allow assignment
			subscription.closed = false as any;
		});
	});

	describe("enable method", () => {
		it("should be a function", () => {
			expectTypeOf<Subscription>().toHaveProperty("unsubscribe").toBeFunction();
		});

		it("should return void", () => {
			expectTypeOf<Subscription>().toHaveProperty("unsubscribe").returns.toEqualTypeOf<void>();
		});

		it("should accept no arguments", () => {
			expectTypeOf<Subscription>().toHaveProperty("unsubscribe").parameters.toEqualTypeOf<[]>();
		});
	});

	describe("disable method", () => {
		it("should be a function", () => {
			expectTypeOf<Subscription>().toHaveProperty("enable").toBeFunction();
		});

		it("should return void", () => {
			expectTypeOf<Subscription>().toHaveProperty("enable").returns.toEqualTypeOf<void>();
		});

		it("should accept no arguments", () => {
			expectTypeOf<Subscription>().toHaveProperty("enable").parameters.toEqualTypeOf<[]>();
		});
	});

	describe("isEnabled property", () => {
		it("should be a boolean", () => {
			expectTypeOf<Subscription>().toHaveProperty("enabled").toEqualTypeOf<boolean>();
		});

		it("should be readonly", () => {
			const Subscription: Subscription = {} as any;
			// @ts-expect-error: should not allow assignment
			Subscription.enabled = false as any;
		});
	});
});
