import { findWorkflow, listWorkflows } from "../workflows/registry.js";

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

  await workflow.run(prompt);
}
