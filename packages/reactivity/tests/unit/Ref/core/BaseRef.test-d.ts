import { BaseRef } from "@/Ref/core/BaseRef";
import type { Ref } from "@/Ref";
import { Observable } from "@/common/types";

describe("BaseRef", () => {
	it("should extend Ref", () => {
		// refer to tests/unit/Ref/types/Ref.test-d.ts for more details
		expectTypeOf<BaseRef<number>>().toExtend<Ref<number>>();
		expectTypeOf<BaseRef<number>>().toExtend<Ref<number, number>>();
	});

	it("should extend Observable", () => {
		// refer to tests/unit/common/types/Observable.test-d.ts for more details
		expectTypeOf<BaseRef<number>>().toExtend<Observable<number>>();
	});

	describe("T type parameter", () => {
		it("should be inferred from constructor argument", () => {
			const ref = new BaseRef(0);
			expectTypeOf(ref).toEqualTypeOf<BaseRef<number>>();
		});
	});
});
