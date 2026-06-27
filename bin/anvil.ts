#!/usr/bin/env bun

import inquirer from 'inquirer';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { help } from './commands/help.js';
import { init } from './commands/init.js';
import { interactive } from './commands/interactive.js';
import { run } from './commands/run.js';
import { transcript } from './commands/transcript.js';
import { listWorkflows, findWorkflow } from './workflows/registry.js';
import { isWorkflowAllowed } from './workflows/init-check.js';
import { BANNER, TAGLINE, workflowCard, divider, status, running, error, color } from './styles.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const args = process.argv.slice(2);

if (args.length === 0) {
  const available = listWorkflows().filter((w) => isWorkflowAllowed(w.id));
  const sorted = [...available].sort((a, b) => (a.id === "interactive" ? 1 : -1));

  // Show banner
  process.stdout.write(BANNER);
  console.log(TAGLINE);
  console.log("");

  const initDone = isWorkflowAllowed("placeholder");

  console.log(divider("SELECT A WORKFLOW"));
  console.log("");

  sorted.forEach((w, i) => {
    const locked = !initDone && !isWorkflowAllowed(w.id);
    console.log(workflowCard(i, w.name, w.description, locked, i === sorted.length - 1));
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
    console.log(`\n${running(`Launching ${color(selected.name, "cyan")}...`)}\n`);
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
  console.error(error(`Unknown command: ${args[0]}`));
  console.error("");
  console.error("Run 'anvil help' for usage information.");
  process.exit(1);
}
