import { RefSubscription } from "@/Ref/RefSubscription";
import { BaseRef } from "@/Ref/BaseRef";
import { Observer } from "@/common/types";
import { $subscriptions } from "@/common/symbols";

describe("RefSubscription", () => {
	let refMock: BaseRef;
	let observerMock: Observer;

	beforeEach(() => {
		refMock = { [$subscriptions]: new Set() } as any;
		observerMock = {
			next: vi.fn(),
		} as any;
	});

	describe("closed property", () => {
		it("should be readonly", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			expect(() => {
				// @ts-expect-error: closed is readonly
				subscription.closed = true;
			}).toThrow(TypeError);
		});

		it("should be false initially", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			expect(subscription.closed).toBe(false);
		});
	});

	describe("enabled property", () => {
		it("should be readonly", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			expect(() => {
				// @ts-expect-error: isEnabled is readonly
				subscription.enabled = false;
			}).toThrow(TypeError);
		});

		it("should be true initially", () => {
			const subscription = new RefSubscription(refMock, observerMock);
			expect(subscription.enabled).toBe(true);
		});
	});

	describe("unsubscribe method", () => {
		it("should set closed to true", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			subscription.unsubscribe();

			expect(subscription.closed).toBe(true);
		});

		it("should set enabled to false", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			subscription.unsubscribe();

			expect(subscription.enabled).toBe(false);
		});

		it("should return undefined", () => {
			const subscription = new RefSubscription(refMock, observerMock);
			const result = subscription.unsubscribe();
			expect(result).toBeUndefined();
		});

		it("should not throw an error when called multiple times", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			expect(() => {
				subscription.unsubscribe();
				subscription.unsubscribe();
			}).not.toThrowError();
		});
	});

	describe("enable method", () => {
		it("should return undefined", () => {
			const subscription = new RefSubscription(refMock, observerMock);
			const result = subscription.enable();
			expect(result).toBeUndefined();
		});

		it("should not throw an error when called multiple times", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			expect(() => {
				subscription.enable();
				subscription.enable();
			}).not.toThrowError();
		});

		it("should set enabled to true", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			subscription.disable();

			expect(subscription.enabled).toBe(false);

			subscription.enable();

			expect(subscription.enabled).toBe(true);
		});
	});

	describe("disable method", () => {
		it("should return undefined", () => {
			const subscription = new RefSubscription(refMock, observerMock);
			const result = subscription.disable();
			expect(result).toBeUndefined();
		});

		it("should not throw an error when called multiple times", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			expect(() => {
				subscription.disable();
				subscription.disable();
			}).not.toThrowError();
		});

		it("should set enabled to false", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			subscription.disable();

			expect(subscription.enabled).toBe(false);
		});
	});

	describe("static notify method", () => {
		it("should return undefined", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			const result = RefSubscription.notify(subscription, "test");

			expect(result).toBeUndefined();
		});

		it("should call observer's next method when subscription is enabled", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			subscription.enable();

			expect(subscription.enabled).toBe(true);

			RefSubscription.notify(subscription, "test");

			expect(observerMock.next).toHaveBeenCalledWith("test");
		});

		it("should not call observer's next method when subscription is disabled", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			subscription.disable();

			expect(subscription.enabled).toBe(false);

			RefSubscription.notify(subscription, "test");

			expect(observerMock.next).not.toHaveBeenCalled();
		});

		it("should not call observer's next method when subscription is closed", () => {
			const subscription = new RefSubscription(refMock, observerMock);

			subscription.unsubscribe();

			expect(subscription.closed).toBe(true);

			RefSubscription.notify(subscription, "test");

			expect(observerMock.next).not.toHaveBeenCalled();
		});
	});
});
