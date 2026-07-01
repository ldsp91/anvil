import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const CONFIG_FILENAME = "anvil.json";

export interface AnvilConfig {
  $schema?: string;
  maxIterations?: number;
  models?: Record<string, string>;
}

/**
 * Load anvil.json from the project root (cwd).
 * Returns undefined if the file does not exist.
 */
export function loadAnvilConfig(cwd: string = process.cwd()): AnvilConfig | undefined {
  const configPath = resolve(cwd, CONFIG_FILENAME);
  if (!existsSync(configPath)) {
    return undefined;
  }

  try {
    const raw = readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as AnvilConfig;
  } catch {
    return undefined;
  }
}

/**
 * Get per-workflow model overrides from the config.
 * Returns a map of workflow ID → model name string, or empty object.
 */
export function getWorkflowModels(cwd: string = process.cwd()): Record<string, string> {
  const config = loadAnvilConfig(cwd);
  return config?.models ?? {};
}

/**
 * Check if a workflow has a model configured.
 * Returns an error message if the model is missing or empty, otherwise undefined.
 */
export function validateWorkflowModel(
  workflowId: string,
  workflowModels: Record<string, string>
): string | undefined {
  const modelName = workflowModels[workflowId];
  
  if (!modelName || modelName.trim() === '') {
    return `Error: Workflow "${workflowId}" does not have a model configured in anvil.json.\nPlease add the model configuration to anvil.json:\n{\n  "models": {\n    "${workflowId}": "<model-name>"\n  }\n}`;
  }
  
  return undefined;
}
