import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { pi, run as agentRun } from "@ai-hero/sandcastle";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";

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

export async function run(prompt: string): Promise<void> {
  const config = loadConfig();

  const result = await agentRun({
    agent: pi(config.model ?? "claude-sonnet-4-6"),
    sandbox: noSandbox(),
    prompt,
    maxIterations: config.maxIterations ?? 5,
  });

  console.log(`\nCompleted in ${result.iterations.length} iterations`);
  console.log(`Branch: ${result.branch}`);
}
