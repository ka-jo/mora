import { Store, Ref } from "@mora-js/reactivity";

describe("Store", () => {
	describe("initialization", () => {
		it("should initialize primitive values", () => {
			const store = Store({ count: 0, name: "test" });
			expect(store).toEqual({ count: 0, name: "test" });
		});

		it("should initialize primitive refs as primitives", () => {
			const store = Store({ count: Ref(0), name: Ref("test") });
			expect(store).toEqual({ count: 0, name: "test" });
		});
	});
});
