import { listWorkflows } from "../workflows/registry.js";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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

  await selected.run(undefined, { skillPaths });
}
