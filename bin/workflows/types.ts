export interface WorkflowRunOptions {
  /** Resolved absolute paths to skill directories to load */
  skillPaths: string[];
  /** Model to use for this workflow (resolved from anvil.json models). Undefined means use default. */
  model?: any;
}

export interface Workflow {
  /** Unique workflow identifier */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Skill names to load (relative to skills/ directory). Empty means all skills. */
  skills?: string[];
  /** Run the workflow */
  run(prompt?: string, options?: WorkflowRunOptions): Promise<void>;
}
