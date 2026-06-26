import { Workflow } from "./types.js";
import { testWorkflow } from "./test.js";

export const workflows: Workflow[] = [testWorkflow];

export function findWorkflow(id: string): Workflow | undefined {
  return workflows.find((w) => w.id === id);
}

export function listWorkflows(): Workflow[] {
  return workflows;
}
