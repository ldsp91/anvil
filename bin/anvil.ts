#!/usr/bin/env bun

import inquirer from 'inquirer';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { help } from './commands/help.js';
import { init } from './commands/init.js';
import { interactive } from './commands/interactive.js';
import { run } from './commands/run.js';
import { transcript } from './commands/transcript.js';
import { color, divider, error, running, status, TAGLINE, workflowCard } from './styles.js';
import { isWorkflowAllowed } from './workflows/init-check.js';
import { findWorkflow, listWorkflows } from './workflows/registry.js';
import { getWorkflowModels, validateWorkflowModel } from './config/loader.js';
import { ModelRegistry } from '@earendil-works/pi-coding-agent';
import { AuthStorage } from '@earendil-works/pi-coding-agent';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

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

const args = process.argv.slice(2);

if (args.length === 0) {
  const available = listWorkflows().filter((w) => isWorkflowAllowed(w.id));
  const sorted = [...available].sort((a, b) =>
    a.id === "interactive" ? 1 : -1,
  );

  console.log(TAGLINE);
  console.log("");

  const initDone = isWorkflowAllowed("placeholder");

  console.log(divider("SELECT A WORKFLOW"));
  console.log("");

  sorted.forEach((w, i) => {
    const locked = !initDone && !isWorkflowAllowed(w.id);
    console.log(
      workflowCard(i, w.name, w.description, locked, i === sorted.length - 1),
    );
    if (i < sorted.length - 1) console.log("");
  });

  console.log("");
  console.log(divider());
  console.log("");

  const { workflow } = await inquirer.prompt({
    name: "workflow",
    type: "select",
    message: "Which workflow would you like to run?",
    choices: sorted.map((w) => ({
      name: `${w.name} — ${w.description}`,
      value: w.id,
    })),
  });

  const selected = findWorkflow(workflow);
  if (selected) {
    // Validate model configuration (skip for interactive workflow)
    if (selected.id !== 'interactive') {
      const workflowModels = getWorkflowModels();
      const validationError = validateWorkflowModel(selected.id, workflowModels);
      if (validationError) {
        console.error(validationError);
        process.exit(1);
      }
    }

    console.log(
      `\n${running(`Launching ${color(selected.name, "cyan")}...`)}\n`,
    );
    const skillPaths = (selected.skills ?? []).map((name) =>
      resolve(rootDir, "skills", name),
    );

    // Resolve model from config
    const workflowModels = getWorkflowModels();
    const modelName = workflowModels[selected.id];
    const model = modelName ? await resolveModel(modelName) : undefined;

    await selected.run(undefined, { skillPaths, model });
  }
} else if (args[0] === "help") {
  help();
} else if (args[0] === "init") {
  await init();
} else if (args[0] === "run") {
  await run(args[1], args[2]);
} else if (args[0] === "transcript") {
  await transcript(args[1]);
} else {
  console.error(error(`Unknown command: ${args[0]}`));
  console.error("");
  console.error("Run 'anvil help' for usage information.");
  process.exit(1);
}
