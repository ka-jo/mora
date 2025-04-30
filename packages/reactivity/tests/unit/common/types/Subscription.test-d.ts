import { Subscription } from "@/common/types";

describe("Subscription", () => {
	describe("unsubscribe method", () => {
		it("should be a function", () => {
			expectTypeOf<Subscription>().toHaveProperty("unsubscribe").toBeFunction();
		});

		it("should return void", () => {
			expectTypeOf<Subscription>()
				.toHaveProperty("unsubscribe")
				.returns.toEqualTypeOf<void>();
		});

		it("should accept no arguments", () => {
			expectTypeOf<Subscription>()
				.toHaveProperty("unsubscribe")
				.parameters.toEqualTypeOf<[]>();
		});
	});

	describe("closed property", () => {
		it("should be a boolean", () => {
			expectTypeOf<Subscription>()
				.toHaveProperty("closed")
				.toEqualTypeOf<boolean>();
		});

		it("should be readonly", () => {
			const subscription: Subscription = {} as any;
			// @ts-expect-error: should not allow assignment
			subscription.closed = false as any;
		});
	});
});
