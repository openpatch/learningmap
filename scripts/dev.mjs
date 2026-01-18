import { cwd } from "process";
import chalk from "chalk";
import { context } from "esbuild";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";

const path = cwd();
const split = path.split("/");
const packageName = split[split.length - 1];

const entries = [];
let entry = `${path}/src/index.ts`;

if (!existsSync(entry)) {
  entry = `${path}/src/index.tsx`;
}
const isEntryExists = existsSync(entry);
let packageJSON;
try {
  packageJSON = readFileSync(join(`${path}/package.json`), "utf-8");
} catch (e) {
  console.error("package.json not found");
  process.exit(1);
}

if (!isEntryExists || !packageJSON) {
  throw new Error(`Entry file missing from ${packageName}`);
}
entries.push(entry);

const bundle = JSON.parse(packageJSON).bundle || [];
const external = [];
if (bundle !== "all") {
  external.push(
    ...[
      ...Object.keys(JSON.parse(packageJSON)?.dependencies || {}).filter(
        (p) => !bundle.includes(p),
      ),
      ...Object.keys(JSON.parse(packageJSON)?.devDependencies || {}).filter(
        (p) => !bundle.includes(p),
      ),
      ...Object.keys(JSON.parse(packageJSON)?.peerDependencies || {}),
    ],
  );
}
external.push("path");
external.push("fs");

const platform = JSON.parse(packageJSON)?.platform || "browser";

const commonConfig = {
  entryPoints: entries,
  outbase: path + "/src",
  outdir: `${path}/dist`,
  sourcemap: true,
  minify: false,
  bundle: true,
  platform,
  external,
};

// Watch for JS/TS changes
const jsCtx = await context({
  ...commonConfig,
  loader: {
    ".svg": "dataurl",
    ".woff2": "dataurl",
  },
  format: "esm",
  plugins: [
    {
      name: "rebuild-notify",
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length > 0) {
            console.log(`${chalk.red("rebuild failed")} - ${packageName}`);
          } else {
            console.log(`${chalk.green("rebuild")} - ${packageName} - js`);
          }
        });
      },
    },
  ],
});

// Watch for CSS changes
const cssCtx = await context({
  entryPoints: [`${path}/src/index.css`],
  outfile: `${path}/dist/index.css`,
  minify: true,
  bundle: true,
  loader: {
    ".svg": "dataurl",
    ".woff2": "dataurl",
  },
  plugins: [
    {
      name: "rebuild-notify",
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length > 0) {
            console.log(`${chalk.red("rebuild failed")} - ${packageName}`);
          } else {
            console.log(`${chalk.green("rebuild")} - ${packageName} - css`);
          }
        });
      },
    },
  ],
});

// Run tsc in watch mode for types
const tsc = spawn("pnpm", ["build:types", "--watch", "--preserveWatchOutput"], {
  cwd: path,
  stdio: "inherit",
  shell: true,
});

console.log(`${chalk.blue("watching")} - ${packageName}`);

await Promise.all([jsCtx.watch(), cssCtx.watch()]);

process.on("SIGINT", async () => {
  await jsCtx.dispose();
  await cssCtx.dispose();
  tsc.kill();
  process.exit(0);
});
