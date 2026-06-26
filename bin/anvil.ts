#!/usr/bin/env bun

import { run, pi } from "@ai-hero/sandcastle";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";

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

  const result = await run({
    agent: pi("claude-sonnet-4-6"),
    sandbox: noSandbox(),
    prompt: args[0],
    maxIterations: 5,
  });

  console.log(`\nCompleted in ${result.iterations.length} iterations`);
  console.log(`Branch: ${result.branch}`);
}

main().catch(console.error);
