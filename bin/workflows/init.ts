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
import { existsSync } from "fs";

const SESSION_DIR = ".sessions";

/**
 * Determines which init step to run based on which files exist.
 */
function getInitStep(): number {
  if (!existsSync(resolve(process.cwd(), "docs", "PROJECT_BRIEF.md"))) {
    return 1;
  }
  if (!existsSync(resolve(process.cwd(), "docs", "PRD.md"))) {
    return 2;
  }
  if (!existsSync(resolve(process.cwd(), "docs", "ARCHITECTURE.md"))) {
    return 3;
  }
  // Add more conditions here for future steps
  return 4;
}

/**
 * Runs a specific init step.
 */
async function runInitStep(
  step: number,
  skillPaths: string[],
  sessionDir: string
): Promise<void> {
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

  let initialMessage: string | undefined;

  switch (step) {
    case 1:
      initialMessage = "/skill:1-init-grill";
      break;
    case 2:
      initialMessage = "/skill:2-prd";
      break;
    case 3:
      initialMessage = "/skill:3-architecture";
      break;
    default:
      console.log(`No init step ${step} defined yet.`);
      return;
  }

  if (initialMessage) {
    const mode = new InteractiveMode(runtime, {
      migratedProviders: [],
      modelFallbackMessage: undefined,
      initialMessage,
      initialImages: [],
      initialMessages: [],
    });

    await mode.run();
  }
}

export const initWorkflow: Workflow = {
  id: "init",
  name: "Init",
  description: "X-step initialization process to define your project",
  skills: ["initialization/1-init-grill", "initialization/2-prd", "initialization/3-architecture"],
  async run(_prompt, options: WorkflowRunOptions) {
    const skillPaths = options?.skillPaths ?? [];
    const sessionDir = resolve(process.cwd(), SESSION_DIR);

    const step = getInitStep();
    console.log(`Init: Running step ${step}...`);

    await runInitStep(step, skillPaths, sessionDir);
  },
};
