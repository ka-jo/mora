import fs from "fs";
import path from "path";

import { defineConfig } from "vitest/config";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		tsconfigPaths(),
		dts({
			rollupTypes: true,
			tsconfigPath: "./tsconfig.build.json",
			beforeWriteFile: (filePath, content) => {
				if (filePath.endsWith(".map")) {
					return { filePath, content };
				} else {
					return {
						filePath,
						// remove all @privateRemarks tags in the generated d.ts files
						content: content.replace(/(\s*\*\s*@privateRemarks\s*[\s\S]*?)(\s*\*\s*@|\*\/)/g, "$2"),
					};
				}
			},
			afterBuild: () => {
				const srcPath = require.resolve("symbol-observable/index.d.ts");
				const distPath = path.resolve(__dirname, "dist/reactivity.d.ts");
				const symbolObservableContent = fs.readFileSync(srcPath, "utf-8");

				fs.appendFileSync(distPath, `\n${symbolObservableContent}`);
			},
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "MoraReactivity",
			fileName: (format) => `mora-reactivity.${format}.js`,
			formats: ["es", "cjs", "umd"],
		},
		rollupOptions: {
			external: ["symbol-observable"],
			output: {
				globals: {
					"symbol-observable": "symbolObservable",
				},
			},
		},
		sourcemap: true,
		minify: false,
	},
	test: {
		globals: true,
		setupFiles: ["./tests/fixtures/expect/toBeRef.ts"],
	},
});
