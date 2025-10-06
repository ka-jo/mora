import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
	resolve: {
		alias: {
			"@": resolve(__dirname, "../src"),
		},
	},
	test: {
		benchmark: {
			outputFile: "./benchmark-results.json",
			reporters: ["verbose"],
		},
	},
});
