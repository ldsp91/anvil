import { listWorkflows } from "../workflows/registry.js";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { ModelRegistry } from "@earendil-works/pi-coding-agent";
import { AuthStorage } from "@earendil-works/pi-coding-agent";
import { getWorkflowModels, validateWorkflowModel } from "../config/loader.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

function readLine(): Promise<string> {
  return new Promise((resolve) => {
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("", (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Resolve a model name string to a Model object using the ModelRegistry.
 * Returns undefined if the model is not found.
 */
async function resolveModel(modelName: string): Promise<any | undefined> {
  try {
    const authStorage = AuthStorage.create();
    const modelRegistry = ModelRegistry.create(authStorage);

    // Search all models for a match by ID
    const allModels = modelRegistry.getAll();
    return allModels.find((m: any) => m.id === modelName);
  } catch {
    return undefined;
  }
}

export async function interactive(): Promise<void> {
  const workflows = listWorkflows();

  console.log("anvil - AI Agent CLI\n");
  console.log("Select a workflow:\n");

  workflows.forEach((w, i) => {
    console.log(`  ${i + 1}. ${w.name} - ${w.description}`);
  });

  console.log();

  const choice = await readLine();
  const index = parseInt(choice, 10) - 1;

  if (isNaN(index) || index < 0 || index >= workflows.length) {
    console.error("Invalid selection.");
    process.exit(1);
  }

  const selected = workflows[index];
  const skillPaths = (selected.skills ?? []).map((name) =>
    resolve(rootDir, "..", "skills", name)
  );

  // Validate model configuration (skip for interactive workflow)
  if (selected.id !== 'interactive') {
    const workflowModels = getWorkflowModels();
    const error = validateWorkflowModel(selected.id, workflowModels);
    if (error) {
      console.error(error);
      process.exit(1);
    }
  }

  // Resolve model from config
  const workflowModels = getWorkflowModels();
  const modelName = workflowModels[selected.id];
  const model = modelName ? await resolveModel(modelName) : undefined;

  await selected.run(undefined, { skillPaths, model });
}
