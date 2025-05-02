import { $Observable, $RefValue } from "@/common/symbols";
import { BaseRef } from "@/Ref/BaseRef";
import { RefSubscription } from "@/Ref/types";

describe("BaseRef", () => {
	describe("constructor", () => {
		it("should return an instance of BaseRef", () => {
			const ref = new BaseRef(0);

			expect(ref).toBeInstanceOf(BaseRef);
		});

		it("should set the initial value", () => {
			const ref = new BaseRef(0);

			expect(ref[$RefValue]).toBe(0);
		});
	});

	describe("get method", () => {
		it("should return the current value", () => {
			const ref = new BaseRef(0);

			expect(ref.get()).toBe(ref[$RefValue]);
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

			expect(ref[$RefValue]).toBe(1);
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

		it("should be callable with a next function and a complete function, but no error function", () => {});

		describe("return value", () => {
			let ref: BaseRef<number>;
			let nextCallback: (value: number) => void;
			let errorCallback: (error: unknown) => void;
			let completeCallback: () => void;
			let subscription: RefSubscription;

			beforeEach(() => {
				ref = new BaseRef(0);
				nextCallback = vi.fn();
				errorCallback = vi.fn();
				completeCallback = vi.fn();
				subscription = ref.subscribe(
					nextCallback,
					errorCallback,
					completeCallback
				);
			});

			describe("closed property", () => {
				it("should be false initially", () => {
					expect(subscription.closed).toBe(false);
				});

				it("should be readonly", () => {
					expect(subscription.closed).toBe(false);
					//@ts-expect-error: closed is readonly
					subscription.closed = true;
					expect(subscription.closed).toBe(false);
				});

				it("should be true after calling unsubscribe", () => {
					expect(subscription.closed).toBe(false);
					subscription.unsubscribe();
					expect(subscription.closed).toBe(true);
				});

				it("should be false after calling disable", () => {
					expect(subscription.closed).toBe(false);
					subscription.disable();
					expect(subscription.closed).toBe(false);
				});
			});

			describe("unsubscribe method", () => {
				it("should return void", () => {
					const result = subscription.unsubscribe();

					expect(result).toBeUndefined();
				});

				it("should not throw an error when called multiple times", () => {
					expect(() => {
						subscription.unsubscribe();
						subscription.unsubscribe();
					}).not.toThrowError();
				});

				it("should prevent further calls to next callback", () => {
					ref.set(1);

					expect(nextCallback).toHaveBeenCalledTimes(1);

					subscription.unsubscribe();

					ref.set(2);

					expect(nextCallback).toHaveBeenCalledTimes(1);
				});

				it("should prevent further calls to error callback", () => {
					// We have no means of triggering an error callback for BaseRef instances. This test was added for consistency and documentation purposes.
				});

				it("should prevent further calls to complete callback", () => {
					subscription.unsubscribe();

					ref.abort();

					expect(completeCallback).not.toHaveBeenCalled();
				});
			});

			describe("isEnabled property", () => {
				it("should be true initially", () => {
					expect(subscription.isEnabled).toBe(true);
				});

				it("should be readonly", () => {
					expect(subscription.isEnabled).toBe(true);
					//@ts-expect-error: isEnabled is readonly
					subscription.isEnabled = false;
					expect(subscription.isEnabled).toBe(true);
				});

				it("should be false after calling disable", () => {
					expect(subscription.isEnabled).toBe(true);
					subscription.disable();
					expect(subscription.isEnabled).toBe(false);
				});

				it("should be true after calling enable", () => {
					expect(subscription.isEnabled).toBe(true);
					subscription.disable();
					expect(subscription.isEnabled).toBe(false);
					subscription.enable();
					expect(subscription.isEnabled).toBe(true);
				});
			});

			describe("enable method", () => {
				it("should return void", () => {
					const result = subscription.enable();

					expect(result).toBeUndefined();
				});

				it("should not throw an error when called multiple times", () => {
					expect(() => {
						subscription.enable();
						subscription.enable();
					}).not.toThrowError();
				});

				it("should allow notifications to observers", () => {
					subscription.disable();

					ref.set(1);

					subscription.enable();

					ref.set(2);

					expect(nextCallback).toHaveBeenCalledTimes(1);
				});
			});

			describe("disable method", () => {
				it("should return void", () => {
					const result = subscription.disable();

					expect(result).toBeUndefined();
				});

				it("should not throw an error when called multiple times", () => {
					expect(() => {
						subscription.disable();
						subscription.disable();
					}).not.toThrowError();
				});

				it("should prevent notifications to observers", () => {
					ref.set(1);

					subscription.disable();

					ref.set(2);

					expect(nextCallback).toHaveBeenCalledTimes(1);
				});
			});
		});
	});

	describe("[$Observable] method", () => {
		it("should return the instance itself", () => {
			const ref = new BaseRef(0);

			expect(ref[$Observable]()).toBe(ref);
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
	});
});
