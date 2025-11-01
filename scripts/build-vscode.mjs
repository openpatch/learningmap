#!/usr/bin/env node

import esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWatch = process.argv.includes("--watch");

// Common options
const commonOptions = {
  bundle: true,
  sourcemap: true,
  minify: !isWatch,
  logLevel: "info",
};

// Build extension (Node.js environment)
const extensionOptions = {
  ...commonOptions,
  entryPoints: [
    path.join(__dirname, "../platforms/vscode/src/extension.ts"),
  ],
  outfile: path.join(__dirname, "../platforms/vscode/dist/extension.js"),
  format: "cjs",
  platform: "node",
  external: ["vscode"],
  target: "node16",
};

// Build webview (Browser environment)
const webviewOptions = {
  ...commonOptions,
  entryPoints: [
    path.join(__dirname, "../platforms/vscode/src/webview.tsx"),
  ],
  outfile: path.join(__dirname, "../platforms/vscode/dist/webview.js"),
  format: "iife",
  platform: "browser",
  target: ["es2020", "chrome90", "firefox90"],
  loader: {
    ".svg": "dataurl",
    ".png": "dataurl",
    ".jpg": "dataurl",
    ".jpeg": "dataurl",
    ".woff": "dataurl",
    ".woff2": "dataurl",
    ".ttf": "dataurl",
    ".eot": "dataurl",
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
};

// Build CSS separately
const cssOptions = {
  ...commonOptions,
  entryPoints: [
    path.join(__dirname, "../packages/learningmap/dist/index.css"),
  ],
  outfile: path.join(__dirname, "../platforms/vscode/dist/webview.css"),
  loader: {
    ".css": "copy",
  },
};

async function build() {
  try {
    if (isWatch) {
      const ctxExtension = await esbuild.context(extensionOptions);
      const ctxWebview = await esbuild.context(webviewOptions);
      
      await Promise.all([
        ctxExtension.watch(),
        ctxWebview.watch(),
      ]);
      
      console.log("Watching for changes...");
    } else {
      await Promise.all([
        esbuild.build(extensionOptions),
        esbuild.build(webviewOptions),
      ]);
      
      // Copy CSS file
      const fs = await import("fs/promises");
      const cssSource = path.join(__dirname, "../packages/learningmap/dist/index.css");
      const cssTarget = path.join(__dirname, "../platforms/vscode/dist/webview.css");
      await fs.copyFile(cssSource, cssTarget);
      
      console.log("Build complete!");
    }
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

build();
