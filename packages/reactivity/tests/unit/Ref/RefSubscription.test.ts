import { mock, instance, when, verify, anything } from "ts-mockito";
import { Observer } from "@/common/types";
import { RefSubscription } from "@/Ref/RefSubscription";

describe("RefSubscription", () => {
	let observerSetMock: Set<Observer<unknown>>;
	let observerMock: Observer<unknown>;

	beforeEach(() => {
		observerSetMock = mock<Set<Observer<unknown>>>();
		observerMock = mock<Observer<unknown>>();
	});

	describe("closed property", () => {
		it("should be readonly", () => {
			const subscription = new RefSubscription(
				instance(observerSetMock),
				instance(observerMock)
			);

			expect(() => {
				// @ts-expect-error: closed is readonly
				subscription.closed = true;
			}).toThrow(TypeError);
		});

		it("should be false initially", () => {
			const subscription = new RefSubscription(
				instance(observerSetMock),
				instance(observerMock)
			);

			expect(subscription.closed).toBe(false);
		});
	});

	describe("isEnabled property", () => {
		it("should be readonly", () => {
			const subscription = new RefSubscription(
				instance(observerSetMock),
				instance(observerMock)
			);

			expect(() => {
				// @ts-expect-error: isEnabled is readonly
				subscription.isEnabled = false;
			}).toThrow(TypeError);
		});

		it("should be true if the observer is in the observers set", () => {
			const observer = instance(observerMock);
			when(observerSetMock.has(observer)).thenReturn(true);
			const subscription = new RefSubscription(
				instance(observerSetMock),
				observer
			);
			expect(subscription.isEnabled).toBe(true);
		});

		it("should be false if the observer is not in the observers set", () => {
			const observer = instance(observerMock);
			when(observerSetMock.has(observer)).thenReturn(false);
			const subscription = new RefSubscription(
				instance(observerSetMock),
				observer
			);
			expect(subscription.isEnabled).toBe(false);
		});
	});

	describe("unsubscribe method", () => {
		it("should remove the observer from the observers set", () => {
			const observer = instance(observerMock);

			const subscription = new RefSubscription(
				instance(observerSetMock),
				observer
			);

			subscription.unsubscribe();

			verify(observerSetMock.delete(observer)).once();
		});

		it("should set closed to true", () => {
			const subscription = new RefSubscription(
				instance(observerSetMock),
				instance(observerMock)
			);

			subscription.unsubscribe();

			expect(subscription.closed).toBe(true);
		});
	});

	describe("enable method", () => {
		it("should add the observer to the observers set if not already present", () => {
			const observer = instance(observerMock);
			when(observerSetMock.has(observer)).thenReturn(false);

			const subscription = new RefSubscription(
				instance(observerSetMock),
				observer
			);

			subscription.enable();

			// The RefSubscription constructor calls add in addition to enable
			verify(observerSetMock.add(observer)).twice();
		});

		it("should not add the observer to the observers set if already present", () => {
			const observer = instance(observerMock);
			when(observerSetMock.has(observer)).thenReturn(true);

			const subscription = new RefSubscription(
				instance(observerSetMock),
				observer
			);

			subscription.enable();

			// The RefSubscription constructor calls add
			verify(observerSetMock.add(anything())).once();
		});
	});

	describe("disable method", () => {
		it("should remove the observer from the observers set if present", () => {
			const observer = instance(observerMock);
			when(observerSetMock.has(observer)).thenReturn(true);

			const subscription = new RefSubscription(
				instance(observerSetMock),
				observer
			);

			subscription.disable();

			verify(observerSetMock.delete(observer)).once();
		});

		it("should not remove the observer from the observers set if not present", () => {
			const observer = instance(observerMock);
			when(observerSetMock.has(observer)).thenReturn(false);

			const subscription = new RefSubscription(
				instance(observerSetMock),
				observer
			);

			subscription.disable();

			verify(observerSetMock.delete(anything())).never();
		});
	});
});
