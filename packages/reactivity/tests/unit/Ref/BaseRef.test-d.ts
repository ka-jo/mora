import { BaseRef } from "@/Ref/BaseRef";
import { RefInstance } from "@/Ref/types";
import { Observable } from "@/common/types";

describe("BaseRef", () => {
	it("should extend RefInstance", () => {
		// refer to tests/unit/Ref/types/RefInstance.test-d.ts for more details
		expectTypeOf<BaseRef<number>>().toExtend<RefInstance<number>>();
		expectTypeOf<BaseRef<number>>().toExtend<RefInstance<number, number>>();
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
