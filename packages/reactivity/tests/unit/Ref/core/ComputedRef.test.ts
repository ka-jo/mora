import { vi } from "vitest";
import { Dependency } from "@/common/Dependency";
import { Subscription } from "@/common/Subscription";
import { Flags } from "@/common/flags";
import { $dependencies, $flags, $observable, $value, $compute } from "@/common/symbols";
import { DependencySet } from "@/common/tracking-context";
import { ComputedRef } from "@/Ref/core/ComputedRef";

// Helper function to create DependencySet with mock dependencies
function createMockDependencySet(dependencies: Dependency[]): DependencySet {
	const depSet = new DependencySet({});
	dependencies.forEach((dep, i) => (depSet[i] = dep));
	(depSet as any).length = dependencies.length;
	return depSet;
}

// Helper function to create a mock dependency with proper source
function createMockDependency(
	overrides: Partial<{
		isDirty: boolean;
		isOutdated: boolean;
		sourceValue: unknown;
		snapshotValue: unknown;
		hasCompute: boolean;
	}>
): Dependency {
	const {
		isDirty = false,
		isOutdated = false,
		sourceValue = 42,
		snapshotValue = 42,
		hasCompute = false,
	} = overrides;

	const mockSource: any = {
		[$flags]: isDirty ? Flags.Dirty : 0,
		[$value]: sourceValue,
	};

	if (hasCompute) {
		mockSource[$compute] = vi.fn();
	}

	const mockSubscription = { unsubscribe: vi.fn() };

	// Create a real dependency but override its value property
	const dep = new Dependency(mockSource, mockSubscription as any);
	// Override the private value to simulate the snapshot
	(dep as any).value = snapshotValue;

	return dep;
}

describe("ComputedRef", () => {
	describe("constructor", () => {
		it("should return an instance of ComputedRef", () => {
			const ref = new ComputedRef({ get: () => 0 });

			expect(ref).toBeInstanceOf(ComputedRef);
		});
	});

	describe("get method", () => {
		it("should call the getter on initial get", () => {
			const getFn = vi.fn(() => 0);
			const ref = new ComputedRef({ get: getFn });

			ref.get();

			expect(getFn).toHaveBeenCalled();
		});

		it("should return the value from the get function", () => {
			const ref = new ComputedRef({ get: () => 42 });

			const result = ref.get();

			expect(result).toBe(42);
		});

		it("should return the cached value if not dirty", () => {
			const getter = vi.fn(() => 42);
			const ref = new ComputedRef({ get: getter });

			ref[$value] = 42; // Simulate cached value
			ref[$flags] = 0; // Simulate not dirty

			const result = ref.get();

			expect(getter).not.toHaveBeenCalled(); // Ensure the getter is not called
			expect(result).toBe(42);
		});

		describe("when the ref is dirty", () => {
			it("should call the getter if any dependencies are outdated", () => {
				const getter = vi.fn(() => 42);
				const ref = new ComputedRef({ get: getter });

				ref[$value] = 27;
				ref[$flags] = Flags.Dirty;
				ref[$dependencies] = createMockDependencySet([
					createMockDependency({
						isOutdated: true,
						sourceValue: 100,
						snapshotValue: 50, // Different values to make it outdated
					}),
				]);

				const result = ref.get();
				// Even though the we set the cached value to 27, the getter should be called because the ref is dirty
				expect(getter).toHaveBeenCalled();
				expect(result).toBe(42);
			});

			it("should not call the getter if no dependencies are outdated", () => {
				const getter = vi.fn(() => 42);
				const ref = new ComputedRef({ get: getter });

				ref[$value] = 27;
				ref[$flags] = Flags.Dirty;
				ref[$dependencies] = createMockDependencySet([
					createMockDependency({
						isOutdated: false,
						sourceValue: 50,
						snapshotValue: 50, // Same values to make it not outdated
					}),
				]);

				const result = ref.get();
				// Even though the we set the cached value to 27, the getter should be called because the ref is dirty
				expect(getter).not.toHaveBeenCalled();
				expect(result).toBe(27);
			});
		});
	});

	describe("set method", () => {
		it("should throw an error if setter not defined", () => {
			const ref = new ComputedRef({ get: () => 0 });

			expect(() => ref.set(1)).toThrow(TypeError);
		});

		it("should return true if setter defined", () => {
			const ref = new ComputedRef({ get: () => 0, set: () => {} });

			const result = ref.set(1);

			expect(result).toBe(true);
		});

		it("should call setter", () => {
			const setFn = vi.fn();
			const ref = new ComputedRef({ get: () => 0, set: setFn });

			ref.set(1);

			expect(setFn).toHaveBeenCalledWith(1);
		});
	});

	describe("subscribe method", () => {
		it("should be callable with an observer", () => {
			const ref = new ComputedRef({ get: () => 0 });
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
			const ref = new ComputedRef({ get: () => 0 });
			const nextCallback = vi.fn();

			expect(() => {
				ref.subscribe(nextCallback);
			}).not.toThrowError();
		});

		it("should be callable with a next function and an error function", () => {
			const ref = new ComputedRef({ get: () => 0 });
			const nextCallback = vi.fn();
			const errorCallback = vi.fn();

			expect(() => {
				ref.subscribe(nextCallback, errorCallback);
			}).not.toThrowError();
		});

		it("should be callable with a next function, an error function, and a complete function", () => {
			const ref = new ComputedRef({ get: () => 0 });
			const nextCallback = vi.fn();
			const errorCallback = vi.fn();
			const completeCallback = vi.fn();

			expect(() => {
				ref.subscribe(nextCallback, errorCallback, completeCallback);
			}).not.toThrowError();
		});

		it("should be callable with a next function and a complete function, but no error function", () => {
			const ref = new ComputedRef({ get: () => 0 });
			const nextCallback = vi.fn();
			const completeCallback = vi.fn();
			expect(() => {
				ref.subscribe(nextCallback, undefined, completeCallback);
			}).not.toThrowError();
		});

		it("should return a Subscription instance", () => {
			const ref = new ComputedRef({ get: () => 0 });
			const nextCallback = vi.fn();

			const subscription = ref.subscribe(nextCallback);

			expect(subscription).toBeInstanceOf(Subscription);
		});

		it("should immediately trigger complete if the ref is disposed", () => {
			const ref = new ComputedRef({ get: () => 0 });
			const completeCallback = vi.fn();

			ref.dispose();

			ref.subscribe({ complete: completeCallback });

			expect(completeCallback).toHaveBeenCalled();
		});
	});

	describe("[$observable] method", () => {
		it("should return the instance itself", () => {
			const ref = new ComputedRef({ get: () => 0 });

			expect(ref[$observable]()).toBe(ref);
		});
	});

	describe("dispose method", () => {
		it("should return void", () => {
			const ref = new ComputedRef({ get: () => 0 });

			const result = ref.dispose();

			expect(result).toBeUndefined();
		});

		it("should trigger complete callback for observers", () => {
			const ref = new ComputedRef({ get: () => 0 });
			const completeCallback = vi.fn();
			ref.subscribe({ complete: completeCallback });

			ref.dispose();

			expect(completeCallback).toHaveBeenCalled();
		});

		it("should prevent further notifications to observers", () => {
			const ref = new ComputedRef({ get: () => 0 });
			const nextCallback = vi.fn();
			ref.subscribe(nextCallback);

			ref.dispose();

			ref.set(1);

			expect(nextCallback).not.toHaveBeenCalled();
		});

		it("should set closed to true for all subscriptions", () => {
			const ref = new ComputedRef({ get: () => 0 });
			const nextCallback = vi.fn();
			const subscription = ref.subscribe(nextCallback);

			ref.dispose();

			expect(subscription.closed).toBe(true);
		});

		it("should set enabled to false for all subscriptions", () => {
			const ref = new ComputedRef({ get: () => 0 });
			const nextCallback = vi.fn();
			const subscription = ref.subscribe(nextCallback);

			ref.dispose();

			expect(subscription.enabled).toBe(false);
		});
	});

	describe("supports AbortSignal", () => {
		it("should trigger complete callback for observers when aborted", () => {
			const controller = new AbortController();
			const ref = new ComputedRef({ get: () => 0, signal: controller.signal });
			const completeCallback = vi.fn();
			ref.subscribe({ complete: completeCallback });

			controller.abort();

			expect(completeCallback).toHaveBeenCalled();
		});

		it("should prevent further notifications to observers", () => {
			const controller = new AbortController();
			const ref = new ComputedRef({ get: () => 0, signal: controller.signal });
			const nextCallback = vi.fn();
			ref.subscribe(nextCallback);

			controller.abort();

			ref.set(1);

			expect(nextCallback).not.toHaveBeenCalled();
		});

		it("should set closed to true for all subscriptions", () => {
			const controller = new AbortController();
			const ref = new ComputedRef({ get: () => 0, signal: controller.signal });
			const nextCallback = vi.fn();
			const subscription = ref.subscribe(nextCallback);

			controller.abort();

			expect(subscription.closed).toBe(true);
		});

		it("should set enabled to false for all subscriptions", () => {
			const controller = new AbortController();
			const ref = new ComputedRef({ get: () => 0, signal: controller.signal });
			const nextCallback = vi.fn();
			const subscription = ref.subscribe(nextCallback);

			controller.abort();

			expect(subscription.enabled).toBe(false);
		});

		it("should handle already-aborted signals", () => {
			const controller = new AbortController();
			controller.abort(); // Abort before creating ref

			const ref = new ComputedRef({ get: () => 0, signal: controller.signal });

			// Ref should be immediately disposed
			expect(ref[$flags] & Flags.Aborted).toBe(Flags.Aborted);
		});

		it("should not notify subscribers when created with already-aborted signal", () => {
			const controller = new AbortController();
			controller.abort(); // Abort before creating ref

			const ref = new ComputedRef({
				get: () => 0,
				set: () => {},
				signal: controller.signal,
			});
			const nextCallback = vi.fn();
			ref.subscribe(nextCallback);

			ref.set(1);

			expect(nextCallback).not.toHaveBeenCalled();
		});

		it("should complete observers immediately when created with already-aborted signal", () => {
			const controller = new AbortController();
			controller.abort(); // Abort before creating ref

			const ref = new ComputedRef({ get: () => 0, signal: controller.signal });
			const completeCallback = vi.fn();
			ref.subscribe({ complete: completeCallback });

			// Complete should have been called during subscription setup
			expect(completeCallback).toHaveBeenCalled();
		});

		it("should have closed subscriptions when created with already-aborted signal", () => {
			const controller = new AbortController();
			controller.abort(); // Abort before creating ref

			const ref = new ComputedRef({ get: () => 0, signal: controller.signal });
			const subscription = ref.subscribe(() => {});

			expect(subscription.closed).toBe(true);
			expect(subscription.enabled).toBe(false);
		});
	});

	it("should not call getter until first access", () => {
		const getter = vi.fn(() => 42);
		const ref = new ComputedRef({ get: getter });

		expect(getter).not.toHaveBeenCalled();

		ref.get();

		expect(getter).toHaveBeenCalled();
	});
});
