import { listWorkflows } from "../workflows/registry.js";
import { formatHelp } from "../styles.js";

export function help(): void {
  const workflows = listWorkflows().map((w) => ({
    id: w.id,
    name: w.name,
    description: w.description,
  }));

  console.log(formatHelp(workflows));
}
