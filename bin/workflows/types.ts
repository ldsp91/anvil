export interface Workflow {
  /** Unique workflow identifier */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Run the workflow */
  run(prompt?: string): Promise<void>;
}
