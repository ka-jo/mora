import { Subscription } from "@/common/types";
import { RefSubscription } from "@/Ref/core/RefSubscription";

describe("RefSubscription", () => {
	it("should extend Subscription", () => {
		expectTypeOf<RefSubscription>().toExtend<Subscription>();
	});

	describe("enable method", () => {
		it("should be a function", () => {
			expectTypeOf<RefSubscription>()
				.toHaveProperty("unsubscribe")
				.toBeFunction();
		});

		it("should return void", () => {
			expectTypeOf<RefSubscription>()
				.toHaveProperty("unsubscribe")
				.returns.toEqualTypeOf<void>();
		});

		it("should accept no arguments", () => {
			expectTypeOf<RefSubscription>()
				.toHaveProperty("unsubscribe")
				.parameters.toEqualTypeOf<[]>();
		});
	});

	describe("disable method", () => {
		it("should be a function", () => {
			expectTypeOf<RefSubscription>().toHaveProperty("enable").toBeFunction();
		});

		it("should return void", () => {
			expectTypeOf<RefSubscription>()
				.toHaveProperty("enable")
				.returns.toEqualTypeOf<void>();
		});

		it("should accept no arguments", () => {
			expectTypeOf<RefSubscription>()
				.toHaveProperty("enable")
				.parameters.toEqualTypeOf<[]>();
		});
	});

	describe("isEnabled property", () => {
		it("should be a boolean", () => {
			expectTypeOf<RefSubscription>()
				.toHaveProperty("enabled")
				.toEqualTypeOf<boolean>();
		});

		it("should be readonly", () => {
			const refSubscription: RefSubscription = {} as any;
			// @ts-expect-error: should not allow assignment
			refSubscription.enabled = false as any;
		});
	});
});
