import { Scope } from "@/Scope";
import { Observable } from "@/common/types";
import type { Scope as ScopeType } from "@/Scope/Scope";

// Mirrors structure/style of Ref.test-d.ts for consistency.

describe("Scope constructor", () => {
	it("should be a function", () => {
		expectTypeOf(Scope).toBeFunction();
	});

	it("should be callable with no args", () => {
		expectTypeOf(Scope).toBeCallableWith();
	});

	it("should accept an options object (parent)", () => {
		expectTypeOf(Scope).toBeCallableWith({ parent: null });
	});

	it("should accept an options object (signal)", () => {
		expectTypeOf(Scope).toBeCallableWith({ signal: new AbortController().signal });
	});

	it("should return a Scope", () => {
		expectTypeOf(Scope).returns.toEqualTypeOf<ScopeType>();
	});
});

describe("Scope type", () => {
	const scope: ScopeType = null as any;

	describe("dispose property", () => {
		it("should be callable with no args and return void", () => {
			expectTypeOf(scope.dispose).toBeCallableWith();
			expectTypeOf(scope.dispose()).toEqualTypeOf<void>();
		});

		it("should extend Observable<void>", () => {
			expectTypeOf(scope.dispose).toExtend<Observable<void>>();
		});
	});

	describe("observe method", () => {
		it("should be a function", () => {
			expectTypeOf(scope.observe).toBeFunction();
		});

		it("should accept an Observable", () => {
			const observable: Observable<number> = {} as any;
			expectTypeOf(scope.observe).toBeCallableWith(observable);
		});

		it("should return void", () => {
			const observable: Observable<number> = {} as any;
			expectTypeOf(scope.observe).returns.toEqualTypeOf<void>();
		});

		it("should accept one argument", () => {
			expectTypeOf(scope.observe).parameters.toEqualTypeOf<[Observable<unknown>]>();
		});
	});
});
