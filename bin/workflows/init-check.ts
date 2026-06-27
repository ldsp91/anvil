import { existsSync } from "fs";
import { resolve } from "path";

const BOOTSTRAP_PLAN = "docs/BOOTSTRAP_PLAN.md";

/**
 * Returns true when the init workflow has reached its final step.
 */
export function isInitComplete(): boolean {
  return existsSync(resolve(process.cwd(), BOOTSTRAP_PLAN));
}

/**
 * Workflow ID that is always allowed, regardless of init state.
 */
const ALWAYS_ALLOWED = new Set(["interactive"]);

/**
 * Returns true if the given workflow is allowed to run.
 *
 * Rules:
 * - `interactive` is always allowed.
 * - When init is not complete, `init` is allowed (so you can finish it).
 * - When init is complete, `init` is blocked and all other workflows
 *   (e.g. `placeholder`) are allowed.
 */
export function isWorkflowAllowed(workflowId: string): boolean {
  if (ALWAYS_ALLOWED.has(workflowId)) {
    return true;
  }
  // init is only allowed when init is not yet complete
  if (workflowId === "init") {
    return !isInitComplete();
  }
  // all other workflows require init to be complete
  return isInitComplete();
}
