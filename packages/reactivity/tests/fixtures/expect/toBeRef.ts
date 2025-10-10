import { $observable, $ref } from "@/common/symbols";

expect.extend({
	toBeRef(received) {
		try {
			expect(received).toMatchObject({
				get: expect.any(Function),
				set: expect.any(Function),
				subscribe: expect.any(Function),
				dispose: expect.any(Function),
				[$ref]: expect.any(Object),
				[$observable]: expect.any(Function),
			});
		} catch (error: any) {
			return {
				message: () => error.message,
				pass: false,
				actual: error.actual,
				expected: error.expected,
			};
		}
		return {
			message: () => "Expected value to be Ref",
			pass: true,
		};
	},
});
