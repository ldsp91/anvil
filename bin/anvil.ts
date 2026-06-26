#!/usr/bin/env bun

import { help } from "./commands/help.js";
import { init } from "./commands/init.js";
import { run } from "./commands/run.js";

const args = process.argv.slice(2);

if (args.includes("--help") || args.length === 0) {
  help();
} else if (args[0] === "init") {
  await init();
} else {
  await run(args[0]);
}
