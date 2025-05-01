import { BaseRef } from "@/Ref/BaseRef";

describe("BaseRef", () => {
	describe("constructor", () => {});

	describe("get method", () => {});

	describe("set method", () => {
		it("should return undefined", () => {
			const ref = new BaseRef(0);

			const result = ref.set(1);

			expect(result).toBeUndefined();
		});

		it("should trigger subscribers when value is different", () => {});

		it("should not trigger subscribers when value is the same", () => {});
	});

	describe("subscribe method", () => {
		describe("return value", () => {
			describe("closed property", () => {
				it("should be readonly", () => {});

				it("should be false initially", () => {});

				it("should be true after calling unsubscribe", () => {});
			});

			describe("unsubscribe method", () => {
				it("should return void", () => {});

				it("should not throw an error when called multiple times", () => {});
			});

			describe("isEnabled property", () => {
				it("should be readonly", () => {});

				it("should be true initially", () => {});

				it("should be false after calling disable", () => {});

				it("should be true after calling enable", () => {});
			});

			describe("enable method", () => {
				it("should return void", () => {});

				it("should not throw an error when called multiple times", () => {});
			});

			describe("disable method", () => {
				it("should return void", () => {});

				it("should not throw an error when called multiple times", () => {});
			});
		});

		it("should be callable with an observer", () => {});

		it("should be callable with a next function", () => {});

		it("should be callable with a next function and an error function", () => {});

		it("should be callable with a next function, an error function, and a complete function", () => {});

		it("should be callable with a next function and a complete function, but no error function", () => {});
	});
});
