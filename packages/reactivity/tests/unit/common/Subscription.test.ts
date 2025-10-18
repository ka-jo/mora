import { Subscription } from "@/common/Subscription";
import { BaseRef } from "@/Ref/core/BaseRef";
import { Observer } from "@/common/types";
import { $subscribers, $subscribersIndex } from "@/common/symbols";

describe("Subscription", () => {
	let refMock: BaseRef;
	let observerMock: Observer;

	beforeEach(() => {
		refMock = { [$subscribers]: [] } as any;
		observerMock = {
			next: vi.fn(),
		} as any;
	});

	/**
	 * Helper to properly initialize a subscription as it would be in real usage.
	 * In production code, subscriptions are created via Subscription.create() which
	 * adds them to the subscribers array with the correct index.
	 */
	function createSubscription(observable = refMock, observer = observerMock): Subscription {
		return Subscription.create(observable, observer);
	}

	describe("closed property", () => {
		it("should be readonly", () => {
			const subscription = createSubscription();

			expect(() => {
				// @ts-expect-error: closed is readonly
				subscription.closed = true;
			}).toThrow(TypeError);
		});

		it("should be false initially", () => {
			const subscription = createSubscription();

			expect(subscription.closed).toBe(false);
		});
	});

	describe("enabled property", () => {
		it("should be readonly", () => {
			const subscription = createSubscription();

			expect(() => {
				// @ts-expect-error: isEnabled is readonly
				subscription.enabled = false;
			}).toThrow(TypeError);
		});

		it("should be true initially", () => {
			const subscription = createSubscription();
			expect(subscription.enabled).toBe(true);
		});
	});

	describe("unsubscribe method", () => {
		it("should set closed to true", () => {
			const subscription = createSubscription();

			subscription.unsubscribe();

			expect(subscription.closed).toBe(true);
		});

		it("should set enabled to false", () => {
			const subscription = createSubscription();

			subscription.unsubscribe();

			expect(subscription.enabled).toBe(false);
		});

		it("should return undefined", () => {
			const subscription = createSubscription();
			const result = subscription.unsubscribe();
			expect(result).toBeUndefined();
		});

		it("should not throw an error when called multiple times", () => {
			const subscription = createSubscription();

			expect(() => {
				subscription.unsubscribe();
				subscription.unsubscribe();
			}).not.toThrowError();
		});
	});

	describe("enable method", () => {
		it("should return undefined", () => {
			const subscription = createSubscription();
			const result = subscription.enable();
			expect(result).toBeUndefined();
		});

		it("should not throw an error when called multiple times", () => {
			const subscription = createSubscription();

			expect(() => {
				subscription.enable();
				subscription.enable();
			}).not.toThrowError();
		});

		it("should set enabled to true", () => {
			const subscription = createSubscription();

			subscription.disable();

			expect(subscription.enabled).toBe(false);

			subscription.enable();

			expect(subscription.enabled).toBe(true);
		});
	});

	describe("disable method", () => {
		it("should return undefined", () => {
			const subscription = createSubscription();
			const result = subscription.disable();
			expect(result).toBeUndefined();
		});

		it("should not throw an error when called multiple times", () => {
			const subscription = createSubscription();

			expect(() => {
				subscription.disable();
				subscription.disable();
			}).not.toThrowError();
		});

		it("should set enabled to false", () => {
			const subscription = createSubscription();

			subscription.disable();

			expect(subscription.enabled).toBe(false);
		});
	});
});
