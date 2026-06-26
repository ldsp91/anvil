#!/usr/bin/env bun

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { pi, run } from '@ai-hero/sandcastle';
import { noSandbox } from '@ai-hero/sandcastle/sandboxes/no-sandbox';

interface AnvilConfig {
  model?: string;
  maxIterations?: number;
}

function loadConfig(): AnvilConfig {
  const configPath = resolve(process.cwd(), "anvil.json");

  let raw: string;
  try {
    raw = readFileSync(configPath, "utf-8");
  } catch (err: any) {
    if (err.code === "ENOENT") {
      console.error(`Error: no anvil.json found in ${process.cwd()}`);
      console.error(
        "Create an anvil.json file in your project root to get started.",
      );
      process.exit(1);
    }
    throw err;
  }

  return JSON.parse(raw) as AnvilConfig;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    console.log(`
anvil - AI Agent CLI

Usage:
  anvil <prompt>

Options:
  --help    Show this help message

Example:
  anvil "Refactor the auth module to use JWT"
    `);
    return;
  }

  const config = loadConfig();
  const prompt = args[0];

  console.log(`\nCompleted in ${result.iterations.length} iterations`);
  console.log(`Branch: ${result.branch}`);
}

main().catch(console.error);
