import { findWorkflow, listWorkflows } from "../workflows/registry.js";
import { isWorkflowAllowed } from "../workflows/init-check.js";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { running, error, info, status, divider, color } from "../styles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

export async function run(workflowId: string, prompt?: string): Promise<void> {
  if (!workflowId) {
    console.log("");
    console.log(divider("AVAILABLE WORKFLOWS"));
    console.log("");

    for (const w of listWorkflows()) {
      const locked = !isWorkflowAllowed(w.id);
      const lock = locked ? "  🔒 " : "  ✔  ";
      console.log(`    ${lock}${color(w.name, "cyan")}    ${w.description}`);
    }

    console.log("");
    console.log(info("Run 'anvil run <name>' to start a workflow."));
    console.log("");
    process.exit(1);
  }

  const workflow = findWorkflow(workflowId);

  if (!workflow) {
    console.error(error(`Workflow "${workflowId}" not found.`));
    console.log("");
    console.log(divider("AVAILABLE WORKFLOWS"));
    console.log("");

    for (const w of listWorkflows()) {
      const locked = !isWorkflowAllowed(w.id);
      const lock = locked ? "  🔒 " : "  ✔  ";
      console.log(`    ${lock}${color(w.name, "cyan")}    ${w.description}`);
    }

    console.log("");
    process.exit(1);
  }

  if (!isWorkflowAllowed(workflowId)) {
    if (workflowId === "init") {
      console.error(error('Init is already complete. Run it again to re-run the bootstrap plan.'));
    } else {
      console.error(error(`Workflow "${workflowId}" is blocked. Run the init workflow first (anvil run init).`));
    }
    process.exit(1);
  }

  console.log("");
  console.log(running(`Running workflow: ${color(workflow.name, "cyan")}`));
  console.log(info(`Description: ${workflow.description}`));
  console.log("");
  console.log(divider());
  console.log("");

  const skillPaths = (workflow.skills ?? []).map((name) =>
    resolve(rootDir, "..", "skills", name)
  );

  await workflow.run(prompt, { skillPaths });

  console.log("");
  console.log(status(`Workflow "${workflow.name}" completed.`));
  console.log("");
}
