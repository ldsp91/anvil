#!/usr/bin/env bun

import { run, pi } from "@ai-hero/sandcastle";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    console.log(`
anvil - AI Agent CLI

Usage:
  anvil <prompt> [options]

Options:
  --model <model>    Model to use (default: claude-sonnet-4-6)
  --max-iterations <n>  Max iterations (default: 5)
  --prompt-file <path>  Path to prompt file
  --help            Show this help message

Example:
  anvil "Refactor the auth module to use JWT"
  anvil --prompt-file prompt.md
    `);
    return;
  }

  const prompt = args[0];
  const model = args.find(a => a.startsWith("--model="))?.split("=")[1] || "claude-sonnet-4-6";
  const maxIterations = parseInt(args.find(a => a.startsWith("--max-iterations="))?.split("=")[1] || "5", 10);
  const promptFile = args.find(a => a.startsWith("--prompt-file="))?.split("=")[1];

  const effectivePrompt = promptFile
    ? Bun.readableStreamFromFile(promptFile)
    : prompt;

  const result = await run({
    agent: pi(model),
    sandbox: noSandbox(),
    prompt: effectivePrompt,
    maxIterations,
  });

  console.log(`\nCompleted in ${result.iterations.length} iterations`);
  console.log(`Branch: ${result.branch}`);
}

main().catch(console.error);
