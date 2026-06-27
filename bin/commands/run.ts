import { findWorkflow, listWorkflows } from "../workflows/registry.js";
import { isWorkflowAllowed } from "../workflows/init-check.js";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

export async function run(workflowId: string, prompt?: string): Promise<void> {
  if (!workflowId) {
    console.error("Error: no workflow specified");
    console.error("Available workflows:");
    for (const w of listWorkflows()) {
      console.error(`  ${w.id}    ${w.description}`);
    }
    process.exit(1);
  }

  const workflow = findWorkflow(workflowId);

  if (!workflow) {
    console.error(`Error: workflow "${workflowId}" not found`);
    console.error("Available workflows:");
    for (const w of listWorkflows()) {
      console.error(`  ${w.id}    ${w.description}`);
    }
    process.exit(1);
  }

  if (!isWorkflowAllowed(workflowId)) {
    if (workflowId === "init") {
      console.error(
        `Error: workflow "init" is blocked — init is already complete.`
      );
    } else {
      console.error(
        `Error: workflow "${workflowId}" is blocked. Run the init workflow first (anvil run init).`
      );
    }
    process.exit(1);
  }

  const skillPaths = (workflow.skills ?? []).map((name) =>
    resolve(rootDir, "..", "skills", name)
  );

  await workflow.run(prompt, { skillPaths });
}
