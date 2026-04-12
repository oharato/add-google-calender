"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { minify } = require("terser");

const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const INJECT_MARKER = "/* @inject browser-core */";

function injectCore(shellSrc, coreSrc) {
  if (!shellSrc.includes(INJECT_MARKER)) {
    throw new Error(`Inject marker not found: ${INJECT_MARKER}`);
  }
  return shellSrc.replace(INJECT_MARKER, coreSrc);
}

async function minifyBookmarkletJs(input) {
  const source = input.replace(/^javascript:/, "").trim();
  const result = await minify(source, {
    compress: {
      passes: 2,
    },
    mangle: true,
    format: {
      comments: false,
      ascii_only: true,
    },
  });

  if (!result.code) {
    throw new Error("Failed to minify bookmarklet source");
  }

  return result.code.trim();
}

async function buildBookmarklet(shellPath, coreSrc, outputName) {
  const shell = fs.readFileSync(shellPath, "utf8");
  const full = injectCore(shell, coreSrc);
  const body = await minifyBookmarkletJs(full);
  const out = `javascript:${body}`;
  fs.writeFileSync(path.join(distDir, outputName), `${out}\n`, "utf8");
  return out;
}

async function buildSimple(inputPath, outputName) {
  const src = fs.readFileSync(inputPath, "utf8");
  const body = await minifyBookmarkletJs(src);
  const out = `javascript:${body}`;
  fs.writeFileSync(path.join(distDir, outputName), `${out}\n`, "utf8");
  return out;
}

async function main() {
  fs.mkdirSync(distDir, { recursive: true });

  const coreSrc = fs.readFileSync(path.join(root, "src", "browser-core.js"), "utf8");

  // Legacy bookmarklet (browser-core inlined, then minified)
  const legacy = await buildBookmarklet(
    path.join(root, "src", "bookmarklet-legacy.js"),
    coreSrc,
    "legacy.bookmarklet.txt"
  );

  // CSP loader bookmarklet (no injection needed)
  const csp = await buildSimple(
    path.join(root, "src", "bookmarklet-csp-loader.js"),
    "csp.bookmarklet.txt"
  );

  // public/csp-runner.js — generated from shell + browser-core (not minified)
  const cspShell = fs.readFileSync(path.join(root, "src", "csp-runner-shell.js"), "utf8");
  fs.writeFileSync(
    path.join(root, "public", "csp-runner.js"),
    injectCore(cspShell, coreSrc),
    "utf8"
  );

  const markdown = [
    "# Bookmarklets",
    "",
    "## Legacy",
    "",
    "```text",
    legacy,
    "```",
    "",
    "## CSP",
    "",
    "```text",
    csp,
    "```",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(distDir, "bookmarklets.md"), markdown, "utf8");
  console.log("Generated dist/legacy.bookmarklet.txt, dist/csp.bookmarklet.txt, and public/csp-runner.js");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
