import { findWorkflow } from "../workflows/registry.js";

export async function run(workflowId: string, prompt?: string): Promise<void> {
  const workflow = findWorkflow(workflowId);

  if (!workflow) {
    console.error(`Error: workflow "${workflowId}" not found`);
    console.error("Run 'anvil help' for available workflows.");
    process.exit(1);
  }

  console.log(`Running workflow: ${workflow.name}`);
  console.log(`Description: ${workflow.description}`);
  console.log("---");

  await workflow.run(prompt);
}
