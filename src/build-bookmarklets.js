"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { minify } = require("terser");

const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");

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

async function buildOne(inputPath, outputName) {
  const src = fs.readFileSync(inputPath, "utf8");
  const body = await minifyBookmarkletJs(src);
  const out = `javascript:${body}`;
  fs.writeFileSync(path.join(distDir, outputName), `${out}\n`, "utf8");
  return out;
}

async function main() {
  fs.mkdirSync(distDir, { recursive: true });

  const legacy = await buildOne(path.join(root, "src", "bookmarklet-legacy.js"), "legacy.bookmarklet.txt");
  const csp = await buildOne(path.join(root, "src", "bookmarklet-csp-loader.js"), "csp.bookmarklet.txt");

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
  console.log("Generated dist/legacy.bookmarklet.txt and dist/csp.bookmarklet.txt");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
