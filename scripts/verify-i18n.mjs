#!/usr/bin/env node
// verify-i18n.mjs — structural parity check for messages/en.json vs messages/es.json
// Plain Node, zero dependencies, ESM.
// Arrays: recurse into element 0's structure only (dictionaries use parallel
// arrays of objects). The path includes a [] marker so the key is still unique.

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

function loadJson(relPath) {
  const full = join(root, relPath);
  return JSON.parse(readFileSync(full, "utf8"));
}

/**
 * Recursively collect leaf key paths from an object.
 * Arrays: record path+"[]" as a node, recurse into element 0 if it's an object.
 * Primitives: leaf path.
 * Returns a Set<string> of all paths.
 */
function collectPaths(obj, prefix = "") {
  const paths = new Set();
  if (obj === null || obj === undefined) {
    paths.add(prefix);
    return paths;
  }
  if (Array.isArray(obj)) {
    const arrayPath = prefix + "[]";
    if (obj.length > 0 && typeof obj[0] === "object" && obj[0] !== null && !Array.isArray(obj[0])) {
      for (const p of collectPaths(obj[0], arrayPath)) {
        paths.add(p);
      }
    } else {
      // Array of primitives or empty — treat as leaf
      paths.add(arrayPath);
    }
    return paths;
  }
  if (typeof obj === "object") {
    for (const [key, val] of Object.entries(obj)) {
      const childPrefix = prefix ? `${prefix}.${key}` : key;
      for (const p of collectPaths(val, childPrefix)) {
        paths.add(p);
      }
    }
    return paths;
  }
  // Primitive: leaf
  paths.add(prefix);
  return paths;
}

const en = loadJson("messages/en.json");
const es = loadJson("messages/es.json");

const enPaths = collectPaths(en);
const esPaths = collectPaths(es);

const enOnly = [...enPaths].filter((p) => !esPaths.has(p)).sort();
const esOnly = [...esPaths].filter((p) => !enPaths.has(p)).sort();

let hasError = false;

if (enOnly.length > 0) {
  hasError = true;
  for (const p of enOnly) {
    console.error(`EN-only: ${p}`);
  }
}

if (esOnly.length > 0) {
  hasError = true;
  for (const p of esOnly) {
    console.error(`ES-only: ${p}`);
  }
}

if (hasError) {
  console.error(
    `\ni18n parity FAILED: ${enOnly.length} EN-only, ${esOnly.length} ES-only`
  );
  process.exit(1);
}

console.log(`i18n parity OK (${enPaths.size} leaf keys)`);
