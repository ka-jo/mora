import { defineProject } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineProject({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		setupFiles: ["./tests/fixtures/expect/toBeRef.ts"],
	},
});
