import { ComputedRef } from "@/Ref/core/ComputedRef";
import type { Ref } from "@/Ref";
import { Observable } from "@/common/types";

describe("ComputedRef", () => {
	it("should extend Ref", () => {
		// refer to tests/unit/Ref/types/Ref.test-d.ts for more details
		expectTypeOf<ComputedRef<number>>().toExtend<Ref<number>>();
		expectTypeOf<ComputedRef<number>>().toExtend<Ref<number, number>>();
	});

	it("should extend Observable", () => {
		// refer to tests/unit/common/types/Observable.test-d.ts for more details
		expectTypeOf<ComputedRef<number>>().toExtend<Observable<number>>();
	});

	describe("TGet type parameter", () => {
		it("should be inferred from constructor argument", () => {
			const ref = new ComputedRef({ get: () => 0 });
			expectTypeOf(ref).toEqualTypeOf<ComputedRef<number>>();
		});
	});

	describe("TSet type parameter", () => {
		it("should default to TGet", () => {
			const ref = new ComputedRef({ get: () => 0 });
			expectTypeOf(ref).toEqualTypeOf<ComputedRef<number, number>>();
		});
	});
});
