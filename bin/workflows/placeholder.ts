import { Workflow, WorkflowRunOptions } from "./types.js";
import {
  createAgentSessionRuntime,
  createAgentSessionServices,
  createAgentSessionFromServices,
  getAgentDir,
  InteractiveMode,
  SessionManager,
} from "@earendil-works/pi-coding-agent";
import { resolve } from "path";

const SESSION_DIR = ".sessions";

/**
 * Placeholder workflow — a minimal scaffold for adding new workflows.
 *
 * To create a new workflow:
 * 1. Copy this file to `bin/workflows/my-workflow.ts`
 * 2. Update the `id`, `name`, `description`, and `skills`
 * 3. Customize the `run` method as needed
 * 4. Import and register it in `registry.ts`
 */
export const placeholderWorkflow: Workflow = {
  id: "placeholder",
  name: "Placeholder",
  description: "A placeholder workflow — replace with your own",
  skills: [],
  async run(_prompt, options: WorkflowRunOptions) {
    const skillPaths = options?.skillPaths ?? [];
    const sessionDir = resolve(process.cwd(), SESSION_DIR);

    const createRuntime = async ({
      cwd,
      sessionManager,
      sessionStartEvent,
    }: {
      cwd: string;
      sessionManager: ReturnType<typeof SessionManager.create>;
      sessionStartEvent: unknown;
    }) => {
      const services = await createAgentSessionServices({
        cwd,
        resourceLoaderOptions: {
          noSkills: true,
          additionalSkillPaths: skillPaths,
        },
      });
      return {
        ...(await createAgentSessionFromServices({
          services,
          sessionManager,
          sessionStartEvent,
          model: options?.model,
        })),
        services,
        diagnostics: services.diagnostics,
      };
    };

    const runtime = await createAgentSessionRuntime(createRuntime, {
      cwd: process.cwd(),
      agentDir: getAgentDir(),
      sessionManager: SessionManager.create(process.cwd(), sessionDir),
    });

    const mode = new InteractiveMode(runtime, {
      migratedProviders: [],
      modelFallbackMessage: undefined,
      initialMessage: undefined,
      initialImages: [],
      initialMessages: [],
    });

    await mode.run();
  },
};
