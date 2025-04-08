import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = process.argv[2] === "production";

const buildOptions = {
	banner: {
		js: banner,
	},
	entryPoints: ["main.ts"],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/closebrackets",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/comment",
		"@codemirror/fold",
		"@codemirror/gutter",
		"@codemirror/highlight",
		"@codemirror/history",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/matchbrackets",
		"@codemirror/panel",
		"@codemirror/rangeset",
		"@codemirror/rectangular-selection",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/stream-parser",
		"@codemirror/text",
		"@codemirror/tooltip",
		"@codemirror/view",
		...builtins,
	],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outfile: "main.js",
};

if (prod) {
	esbuild.build(buildOptions).catch(() => process.exit(1));
} else {
	const startWatch = async () => {
		try {
			const ctx = await esbuild.context(buildOptions);
			await ctx.watch();
			console.log("Watching for changes...");
		} catch (error) {
			console.error(error);
			process.exit(1);
		}
	};

	startWatch();
}
