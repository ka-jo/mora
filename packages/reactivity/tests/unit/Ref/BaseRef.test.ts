import { $observable, $value } from "@/common/symbols";
import { BaseRef } from "@/Ref/BaseRef";
import { RefSubscription } from "@/Ref/RefSubscription";

describe("BaseRef", () => {
	describe("constructor", () => {
		it("should return an instance of BaseRef", () => {
			const ref = new BaseRef(0);

			expect(ref).toBeInstanceOf(BaseRef);
		});

		it("should set the initial value", () => {
			const ref = new BaseRef(0);

			expect(ref[$value]).toBe(0);
		});
	});

	describe("get method", () => {
		it("should return the current value", () => {
			const ref = new BaseRef(0);

			expect(ref.get()).toBe(ref[$value]);
		});
	});

	describe("set method", () => {
		it("should return undefined", () => {
			const ref = new BaseRef(0);

			const result = ref.set(1);

			expect(result).toBeUndefined();
		});

		it("should set the value", () => {
			const ref = new BaseRef(0);

			ref.set(1);

			expect(ref[$value]).toBe(1);
		});

		it("should notify observers when value is different", () => {
			const ref = new BaseRef(0);
			const nextCallback = vi.fn();
			ref.subscribe(nextCallback);

			ref.set(1);

			expect(nextCallback).toHaveBeenCalledWith(1);
		});

		it("should not notify observers when value is the same", () => {
			const ref = new BaseRef(0);
			const nextCallback = vi.fn();
			ref.subscribe(nextCallback);

			ref.set(0);

			expect(nextCallback).not.toHaveBeenCalled();
		});
	});

	describe("subscribe method", () => {
		it("should be callable with an observer", () => {
			const ref = new BaseRef(0);
			const nextCallback = vi.fn();
			const errorCallback = vi.fn();
			const completeCallback = vi.fn();

			expect(() => {
				ref.subscribe({
					next: nextCallback,
					error: errorCallback,
					complete: completeCallback,
				});
			}).not.toThrowError();
		});

		it("should be callable with a next function", () => {
			const ref = new BaseRef(0);
			const nextCallback = vi.fn();

			expect(() => {
				ref.subscribe(nextCallback);
			}).not.toThrowError();
		});

		it("should be callable with a next function and an error function", () => {
			const ref = new BaseRef(0);
			const nextCallback = vi.fn();
			const errorCallback = vi.fn();

			expect(() => {
				ref.subscribe(nextCallback, errorCallback);
			}).not.toThrowError();
		});

		it("should be callable with a next function, an error function, and a complete function", () => {
			const ref = new BaseRef(0);
			const nextCallback = vi.fn();
			const errorCallback = vi.fn();
			const completeCallback = vi.fn();

			expect(() => {
				ref.subscribe(nextCallback, errorCallback, completeCallback);
			}).not.toThrowError();
		});

		it("should be callable with a next function and a complete function, but no error function", () => {
			const ref = new BaseRef(0);
			const nextCallback = vi.fn();
			const completeCallback = vi.fn();
			expect(() => {
				ref.subscribe(nextCallback, undefined, completeCallback);
			}).not.toThrowError();
		});

		it("should return a RefSubscription instance", () => {
			const ref = new BaseRef(0);
			const nextCallback = vi.fn();

			const subscription = ref.subscribe(nextCallback);

			expect(subscription).toBeInstanceOf(RefSubscription);
		});

		it("should immediately trigger complete if the ref is aborted", () => {
			const ref = new BaseRef(0);
			const completeCallback = vi.fn();

			ref.abort();

			ref.subscribe({ complete: completeCallback });

			expect(completeCallback).toHaveBeenCalled();
		});
	});

	describe("[$Observable] method", () => {
		it("should return the instance itself", () => {
			const ref = new BaseRef(0);

			expect(ref[$observable]()).toBe(ref);
		});
	});

	describe("abort method", () => {
		it("should return void", () => {
			const ref = new BaseRef(0);

			const result = ref.abort();

			expect(result).toBeUndefined();
		});

		it("should trigger complete callback", () => {
			const ref = new BaseRef(0);
			const completeCallback = vi.fn();
			ref.subscribe({ complete: completeCallback });

			ref.abort();

			expect(completeCallback).toHaveBeenCalled();
		});

		it("should prevent further notifications to observers", () => {
			const ref = new BaseRef(0);
			const nextCallback = vi.fn();
			ref.subscribe(nextCallback);

			ref.abort();

			ref.set(1);

			expect(nextCallback).not.toHaveBeenCalled();
		});

		it("should set closed to true for all subscriptions", () => {
			const ref = new BaseRef(0);
			const nextCallback = vi.fn();
			const subscription = ref.subscribe(nextCallback);

			ref.abort();

			expect(subscription.closed).toBe(true);
		});

		it("should set enabled to false for all subscriptions", () => {
			const ref = new BaseRef(0);
			const nextCallback = vi.fn();
			const subscription = ref.subscribe(nextCallback);

			ref.abort();

			expect(subscription.enabled).toBe(false);
		});
	});
});
