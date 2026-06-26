#!/usr/bin/env bun

import { help } from "./commands/help.js";
import { init } from "./commands/init.js";
import { run } from "./commands/run.js";
import { interactive } from "./commands/interactive.js";
import { transcript } from "./commands/transcript.js";

const args = process.argv.slice(2);

if (args.length === 0) {
  await interactive();
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
