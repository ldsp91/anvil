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

export const initWorkflow: Workflow = {
  id: "init",
  name: "Init",
  description: "X-step initialization process to define your project",
  skills: ["initialization/1-init-grill"],
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
