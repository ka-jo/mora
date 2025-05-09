import { flushMicrotasks } from "../fixtures/util";
import { Flags } from "@/common/flags";
import { $flags } from "@/common/symbols";
import { Ref } from "@/Ref";
import { ReadonlyRef, Ref } from "@/Ref/types";

test("computed with one dependency", () => {
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

it("should be marked dirty when upstream dependencies change", () => {
	const count = Ref(1);
	const remainder = Ref.computed(() => count.get() % 2);
	const isEven = Ref.computed(() => remainder.get() === 0);
	const onDirty = vi.fn();
	isEven.subscribe({ dirty: onDirty });

	count.set(3);

	expect(onDirty).toHaveBeenCalled();
	expect((isEven[$flags] & Flags.Dirty) === Flags.Dirty).toBe(true);
});

describe("lazy evaluation", () => {
	it("should compute on first access if not computed", () => {
		const count = Ref(1);
		const fn = vi.fn(() => count.get() * 2);
		const double = Ref.computed(fn);

		expect(fn).not.toHaveBeenCalled();
		double.get(); // Access value
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("should compute on first subscription if not computed", async () => {
		const count = Ref(1);
		const fn = vi.fn(() => count.get() * 2);
		const double = Ref.computed(fn);

		expect(fn).not.toHaveBeenCalled();

		double.subscribe({ next: () => {} });

		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("should cache value after compute", () => {
		const count = Ref(1);
		const fn = vi.fn(() => count.get() * 2);
		const double = Ref.computed(fn);

		double.get(); // First access
		expect(fn).toHaveBeenCalledTimes(1);

		double.get(); // Second access, should use cached value
		expect(fn).toHaveBeenCalledTimes(1);
	});

	describe("when marked dirty", () => {
		let count: Ref<number>;
		let remainder: ReadonlyRef<number>;
		let isEvenGetter: () => boolean;
		let isEven: ReadonlyRef<boolean>;

		beforeEach(() => {
			count = Ref(1);
			remainder = Ref.computed(() => count.get() % 2);
			isEvenGetter = vi.fn(() => remainder.get() === 0);
			isEven = Ref.computed(isEvenGetter);
		});

		it("should not compute if no subscribers", async () => {
			isEven.get();
			// first access should always compute
			expect(isEvenGetter).toHaveBeenCalledTimes(1);

			count.set(2);

			await flushMicrotasks();

			expect(isEvenGetter).toHaveBeenCalledTimes(1);
		});

		it("should not compute if no dependencies changed", async () => {
			isEven.get();
			// first access should always compute
			expect(isEvenGetter).toHaveBeenCalledTimes(1);

			// setting upstream count to 3 should mark isEven dirty even though remainder won't change
			count.set(3);

			await flushMicrotasks();

			expect(isEvenGetter).toHaveBeenCalledTimes(1);
		});

		it("should not compute on next access if no dependencies changed", () => {
			isEven.get();
			// first access should always compute
			expect(isEvenGetter).toHaveBeenCalledTimes(1);

			// setting upstream count to 3 should mark isEven dirty even though remainder won't change
			count.set(3);
			isEven.get();

			// second access should not compute because dependencies didn't change
			expect(isEvenGetter).toHaveBeenCalledTimes(1);
		});

		it("should compute if dependencies changed and has subscribers", async () => {
			isEven.get();
			expect(isEvenGetter).toHaveBeenCalledTimes(1);

			isEven.subscribe({ next: () => {} });

			// setting count to true should make remainder change
			count.set(2);

			await flushMicrotasks();

			expect(isEvenGetter).toHaveBeenCalledTimes(2);
		});

		it("should compute on next access if dependencies changed and has subscribers", () => {
			isEven.get();
			expect(isEvenGetter).toHaveBeenCalledTimes(1);

			isEven.subscribe({ next: () => {} });

			count.set(2);
			isEven.get();

			expect(isEvenGetter).toHaveBeenCalledTimes(2);
		});
	});
});

describe("error handling", () => {
	it("should propagate errors from the computed function", () => {
		const errorComputed = Ref.computed(() => {
			throw new Error("Test error");
		});

		expect(() => errorComputed.get()).toThrow();
	});

	it("should wrap thrown non-Error values in Error", () => {
		const errorComputed = Ref.computed(() => {
			throw "Test error";
		});

		expect(() => errorComputed.get()).toThrow(Error);
	});

	it("should notify subscribers of errors", () => {
		const errorComputed = Ref.computed(() => {
			throw new Error("Test error");
		});
		const onError = vi.fn();
		errorComputed.subscribe({ error: onError });

		expect(() => {
			errorComputed.get();
			// This is sneaky testing that subscribe won't trigger onError as well
			expect(onError).toHaveBeenCalledTimes(1);
		}).toThrow();
	});
});
