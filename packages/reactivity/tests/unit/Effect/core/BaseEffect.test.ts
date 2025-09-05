import { BaseEffect } from "@/Effect/core/BaseEffect";

describe("BaseEffect", () => {
	describe("constructor", () => {
		it("should return an instance of BaseEffect", () => {
			const effect = new BaseEffect(() => {});

			expect(effect).toBeInstanceOf(BaseEffect);
		});
	});
});
