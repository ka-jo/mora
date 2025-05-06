import { Ref } from "@/Ref/Ref";

describe("computed", () => {
	test("basic computation from a ref", () => {
		const count = Ref(1);
		const doubleCount = Ref.computed(() => count.get() * 2);

		expect(doubleCount.get()).toBe(2);

		count.set(2);

		expect(doubleCount.get()).toBe(4);
	});

	test("computed with multiple dependencies", () => {
		const count = Ref(1);
		const multiplier = Ref(2);
		const result = Ref.computed(() => count.get() * multiplier.get());

		expect(result.get()).toBe(2);

		count.set(2);

		expect(result.get()).toBe(4);

		multiplier.set(3);

		expect(result.get()).toBe(6);
	});

	test("chained computed values", () => {
		const count = Ref(1);
		const doubled = Ref.computed(() => count.get() * 2);
		const quadrupled = Ref.computed(() => doubled.get() * 2);

		expect(quadrupled.get()).toBe(4);
		count.set(2);
		expect(quadrupled.get()).toBe(8);
	});
});

describe("computed optimizations", () => {
	test("lazy evaluation - getter is not called until value is accessed", () => {
		const count = Ref(1);
		const fn = vi.fn(() => count.get() * 2);
		const double = Ref.computed(fn);

		expect(fn).not.toHaveBeenCalled();
		double.get(); // Access value
		expect(fn).toHaveBeenCalledTimes(1);
	});

	test("caching - getter is not called if dependencies haven't changed", () => {
		const count = Ref(1);
		const fn = vi.fn(() => count.get() * 2);
		const double = Ref.computed(fn);

		double.get(); // First access
		expect(fn).toHaveBeenCalledTimes(1);

		double.get(); // Second access, should use cached value
		expect(fn).toHaveBeenCalledTimes(1);

		count.set(2); // Change dependency
		double.get(); // Should recompute
		expect(fn).toHaveBeenCalledTimes(2);
	});
});

describe("computed edge cases", () => {
	test("handles errors in computation", () => {
		const count = Ref(1);
		const errComputed = Ref.computed(() => {
			if (count.get() < 0) throw new Error("Negative value");
			return count.get();
		});

		expect(errComputed.get()).toBe(1);

		count.set(-1);

		expect(() => errComputed.get()).toThrow("Negative value");
	});

	test("computed value can be passed to another computed", () => {
		const count = Ref(1);
		const double = Ref.computed(() => count.get() * 2);
		const isEven = Ref.computed(() => double.get() % 2 === 0);

		expect(isEven.get()).toBe(true);
		count.set(2);
		expect(double.get()).toBe(4);
		expect(isEven.get()).toBe(true);
	});
});
