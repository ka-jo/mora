import { Scope } from "@/Scope";
import { Ref } from "@/Ref";

describe("Scope", () => {
	describe("constructor", () => {
		it("should be callable with new keyword", () => {
			expect(() => {
				//@ts-ignore: TypeScript doesn't like this, and to be honest, I'm not convinced we should
				// encourage using 'new', but I think it's worth documenting the behavior
				const scope = new Scope();
				expect(scope).toBeDefined();
			}).not.toThrowError();
		});

		it("should be callable without new keyword", () => {
			expect(() => {
				const scope = Scope();
				expect(scope).toBeDefined();
			}).not.toThrowError();
		});

		it("should be callable with options", () => {
			expect(() => {
				const scope = Scope({ parent: null });
				expect(scope).toBeDefined();
			}).not.toThrowError();
		});
	});

	describe("static isScope method", () => {
		it("should return true for Scope instance", () => {
			const scope = Scope();
			expect(Scope.isScope(scope)).toBe(true);
		});

		it("should return false for non-Scope instance", () => {
			const notScope = { dispose: () => {}, observe: () => {} };
			expect(Scope.isScope(notScope)).toBe(false);
		});

		it("should return false for null", () => {
			expect(Scope.isScope(null)).toBe(false);
		});

		it("should return false for undefined", () => {
			expect(Scope.isScope(undefined)).toBe(false);
		});
	});

	it("should support instanceof operator", () => {
		const scope = Scope();
		expect(scope).toBeInstanceOf(Scope);
	});

	describe("dispose method", () => {
		it("should be callable", () => {
			const scope = Scope();
			expect(() => {
				scope.dispose();
			}).not.toThrowError();
		});

		it("should be idempotent", () => {
			const scope = Scope();
			expect(() => {
				scope.dispose();
				scope.dispose();
				scope.dispose();
			}).not.toThrowError();
		});
	});

	describe("observe method", () => {
		it("should be callable with an observable", () => {
			const scope = Scope();
			const ref = Ref(42);

			expect(() => {
				scope.observe(ref);
			}).not.toThrowError();
		});

		it("should handle multiple observations", () => {
			const scope = Scope();
			const ref1 = Ref(1);
			const ref2 = Ref(2);

			expect(() => {
				scope.observe(ref1);
				scope.observe(ref2);
			}).not.toThrowError();
		});

		it("should handle repeated observations of same observable", () => {
			const scope = Scope();
			const ref = Ref(42);

			expect(() => {
				scope.observe(ref);
				scope.observe(ref);
				scope.observe(ref);
			}).not.toThrowError();
		});

		it("should not throw after disposal", () => {
			const scope = Scope();
			const ref = Ref(42);

			scope.dispose();

			expect(() => {
				scope.observe(ref);
			}).not.toThrowError();
		});
	});

	describe("observables method", () => {
		it("should return an iterable iterator", () => {
			const scope = Scope();
			const result = scope.observables();

			expect(result).toBeDefined();
			expect(typeof result[Symbol.iterator]).toBe("function");
			expect(typeof result.next).toBe("function");
		});

		it("should be iterable with for...of", () => {
			const scope = Scope();
			const ref = Ref(42);
			scope.observe(ref);

			expect(() => {
				for (const observable of scope.observables()) {
					expect(observable).toBe(ref);
				}
			}).not.toThrowError();
		});

		it("should be convertible to array", () => {
			const scope = Scope();
			const ref1 = Ref(1);
			const ref2 = Ref(2);
			scope.observe(ref1);
			scope.observe(ref2);

			const observables = Array.from(scope.observables());
			expect(observables).toHaveLength(2);
			expect(observables).toContain(ref1);
			expect(observables).toContain(ref2);
		});

		it("should return empty iterator for new scope", () => {
			const scope = Scope();
			const observables = Array.from(scope.observables());

			expect(observables).toHaveLength(0);
		});

		it("should return empty iterator after disposal", () => {
			const scope = Scope();
			const ref = Ref(42);
			scope.observe(ref);

			scope.dispose();

			const observables = Array.from(scope.observables());
			expect(observables).toHaveLength(0);
		});
	});

	describe("scopes method", () => {
		it("should return an iterable iterator", () => {
			const scope = Scope();
			const result = scope.scopes();

			expect(result).toBeDefined();
			expect(typeof result[Symbol.iterator]).toBe("function");
			expect(typeof result.next).toBe("function");
		});

		it("should be iterable with for...of", () => {
			const parent = Scope();
			const child = Scope({ parent });

			expect(() => {
				for (const scope of parent.scopes()) {
					expect(scope).toBe(child);
				}
			}).not.toThrowError();
		});

		it("should be convertible to array", () => {
			const parent = Scope();
			const child1 = Scope({ parent });
			const child2 = Scope({ parent });

			const scopes = Array.from(parent.scopes());
			expect(scopes).toHaveLength(2);
			expect(scopes).toContain(child1);
			expect(scopes).toContain(child2);
		});

		it("should return empty iterator for new scope", () => {
			const scope = Scope();
			const scopes = Array.from(scope.scopes());

			expect(scopes).toHaveLength(0);
		});

		it("should return empty iterator after disposal", () => {
			const parent = Scope();
			const child = Scope({ parent });

			parent.dispose();

			const scopes = Array.from(parent.scopes());
			expect(scopes).toHaveLength(0);
		});
	});
});
