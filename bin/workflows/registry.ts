import { Workflow } from "./types.js";
import { interactiveWorkflow } from "./interactive.js";

export const workflows: Workflow[] = [interactiveWorkflow];

export function findWorkflow(id: string): Workflow | undefined {
  return workflows.find((w) => w.id === id);
}

export function listWorkflows(): Workflow[] {
  return workflows;
}
