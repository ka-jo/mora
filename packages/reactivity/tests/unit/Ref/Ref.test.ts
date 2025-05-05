import { Ref } from "@/Ref/Ref";

describe("Ref", () => {
	describe("constructor", () => {
		it("should be callable with new keyword", () => {
			expect(() => {
				//@ts-ignore: TypeScript doesn't like this, and to be honest, I'm not convinced we should
				// encourage using 'new', but I think it's worth documenting the behavior
				const ref = new Ref(0);
				expect(ref).toBeRef();
			}).not.toThrowError();
		});

		it("should be callable without new keyword", () => {
			expect(() => {
				const ref = Ref(0);
				expect(ref).toBeRef();
			}).not.toThrowError();
		});
	});

	describe("static isRef method", () => {
		it("should return true for Ref instance", () => {
			const ref = Ref(0);
			expect(Ref.isRef(ref)).toBe(true);
		});

		it("should return false for non-Ref instance", () => {
			const notRef = { get: () => {}, set: () => {} };
			expect(Ref.isRef(notRef)).toBe(false);
		});
	});

	it("should support instanceof operator", () => {
		const ref = Ref(0);
		expect(ref).toBeInstanceOf(Ref);
	});
});
