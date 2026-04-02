"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");

function minifyBookmarkletJs(input) {
  return input
    .replace(/^javascript:/, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildOne(inputPath, outputName) {
  const src = fs.readFileSync(inputPath, "utf8");
  const body = minifyBookmarkletJs(src);
  const out = `javascript:${body}`;
  fs.writeFileSync(path.join(distDir, outputName), `${out}\n`, "utf8");
  return out;
}

fs.mkdirSync(distDir, { recursive: true });

const legacy = buildOne(path.join(root, "src", "bookmarklet-legacy.js"), "legacy.bookmarklet.txt");
const csp = buildOne(path.join(root, "src", "bookmarklet-csp-loader.js"), "csp.bookmarklet.txt");

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
