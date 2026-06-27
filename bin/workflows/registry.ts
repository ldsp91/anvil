import { Workflow } from "./types.js";
import { interactiveWorkflow } from "./interactive.js";
import { initWorkflow } from "./init.js";
import { placeholderWorkflow } from "./placeholder.js";

export const workflows: Workflow[] = [interactiveWorkflow, initWorkflow, placeholderWorkflow];

export function findWorkflow(id: string): Workflow | undefined {
  return workflows.find((w) => w.id === id);
}

export function listWorkflows(): Workflow[] {
  return workflows;
}
