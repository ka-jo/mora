import "vitest";
import { ISchemaValidation } from "@/Types/SchemaValidation";

interface CustomMatchers<R = unknown> {
	/**
	 * Asserts that the value is a Ref by checking if it has the following properties:
	 * - `get`
	 * - `set`
	 * - `subscribe`
	 * - `abort`
	 * - `[$ref]`
	 * - `[$observable]`
	 */
	toBeRef: () => R;
}

declare module "vitest" {
	interface Assertion<T = any> extends CustomMatchers<T> {}

	interface AsymmetricMatchersContaining extends CustomMatchers {}
}
