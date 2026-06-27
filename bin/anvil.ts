#!/usr/bin/env bun

import inquirer from 'inquirer';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { help } from './commands/help.js';
import { init } from './commands/init.js';
import { interactive } from './commands/interactive.js';
import { run } from './commands/run.js';
import { transcript } from './commands/transcript.js';
import { listWorkflows } from './workflows/registry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const args = process.argv.slice(2);

if (args.length === 0) {
  const { workflow } = await inquirer.prompt({
    name: "workflow",
    type: "select",
    message: "Select a workflow:",
    choices: listWorkflows().map((w) => ({
      name: `${w.name} — ${w.description}`,
      value: w.id,
    })),
  });

  const selected = listWorkflows().find((w) => w.id === workflow);
  if (selected) {
    const skillPaths = (selected.skills ?? []).map((name) =>
      resolve(rootDir, 'skills', name)
    );
    await selected.run(undefined, { skillPaths });
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
  console.error(`Unknown command: ${args[0]}`);
  console.error("Run 'anvil help' for usage information.");
  process.exit(1);
}
