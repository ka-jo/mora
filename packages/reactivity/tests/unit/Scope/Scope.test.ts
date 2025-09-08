import { describe, it, expect, vi } from "vitest";
import { Scope } from "@/Scope";
import { pushActiveScope, popActiveScope } from "@/common/current-scope";
import { $parent, $children } from "@/common/symbols";

describe("Scope", () => {
	it("should attach to the last active scope by default", () => {
		const root = Scope();
		pushActiveScope(root);
		const child = Scope();
		popActiveScope();

		expect((child as any)[$parent]).toBe(root);
		expect((root as any)[$children]).toContain(child);
	});

	it("should allow creating a detached scope with parent: null", () => {
		const root = Scope();
		pushActiveScope(root);
		const detached = Scope({ parent: null });
		popActiveScope();

		expect((detached as any)[$parent]).toBeNull();
		expect((root as any)[$children]).not.toContain(detached);
	});

	it("should allow explicitly specifying a parent overriding the active scope", () => {
		const grand = Scope();
		const parent = Scope();
		pushActiveScope(grand);
		const child = Scope({ parent });
		popActiveScope();

		expect((child as any)[$parent]).toBe(parent);
		expect((child as any)[$parent]).not.toBe(grand);
		expect((parent as any)[$children]).toContain(child);
		expect((grand as any)[$children]).not.toContain(child);
	});

	it("should dispose children before parent", () => {
		const order: string[] = [];
		const root = Scope();
		pushActiveScope(root);
		const a = Scope();
		pushActiveScope(a);
		const a1 = Scope();
		popActiveScope();
		const b = Scope();
		popActiveScope();

		a1.dispose.subscribe(() => order.push("a1"));
		a.dispose.subscribe(() => order.push("a"));
		b.dispose.subscribe(() => order.push("b"));
		root.dispose.subscribe(() => order.push("root"));

		root.dispose();

		expect(order).toEqual(["a1", "a", "b", "root"]);
	});

	it("should be idempotent", () => {
		const order: string[] = [];
		const root = Scope();
		const onDispose = vi.fn(() => order.push("root"));
		root.dispose.subscribe(onDispose);

		root.dispose();
		root.dispose();

		expect(onDispose).toHaveBeenCalledTimes(1);
		expect(order).toEqual(["root"]);
	});

	it("should not accept new children after being disposed", () => {
		const root = Scope();
		root.dispose();

		pushActiveScope(root);
		// We're not actually running this in the root scope, so this test isn't actually testing anything yet
		expect(() => Scope()).toThrow();
		popActiveScope();
	});

	it("should support AbortSignal that disposes the scope", () => {
		const controller = new AbortController();
		const scope = Scope({ signal: controller.signal });
		const spy = vi.fn();
		scope.dispose.subscribe(spy);

		controller.abort();

		// Disposed state is internal; rely on callback to confirm.
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it("should notify via next and complete on dispose", () => {
		const next = vi.fn();
		const complete = vi.fn();
		const scope = Scope();

		scope.dispose.subscribe(next, undefined, complete);
		scope.dispose();

		expect(next).toHaveBeenCalledTimes(1);
		expect(complete).toHaveBeenCalledTimes(1);
	});

	it("should call complete immediately when subscribing after disposal", () => {
		const next = vi.fn();
		const complete = vi.fn();
		const scope = Scope();

		scope.dispose();
		scope.dispose.subscribe(next, undefined, complete);

		expect(next).not.toHaveBeenCalled();
		expect(complete).toHaveBeenCalledTimes(1);
	});
});
