import { ComputedRef } from "@/Ref/ComputedRef";
import { RefInstance } from "@/Ref/types";
import { Observable } from "@/common/types";

describe("ComputedRef", () => {
	it("should extend RefInstance", () => {
		// refer to tests/unit/Ref/types/RefInstance.test-d.ts for more details
		expectTypeOf<ComputedRef<number>>().toExtend<RefInstance<number>>();
		expectTypeOf<ComputedRef<number>>().toExtend<RefInstance<number, number>>();
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
