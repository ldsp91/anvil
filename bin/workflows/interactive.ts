import { Workflow } from "./types.js";
import {
  createAgentSessionRuntime,
  createAgentSessionServices,
  createAgentSessionFromServices,
  getAgentDir,
  InteractiveMode,
  SessionManager,
  DefaultResourceLoader,
} from "@earendil-works/pi-coding-agent";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..", "..");

export const interactiveWorkflow: Workflow = {
  id: "interactive",
  name: "Interactive",
  description: "Full Pi terminal UI with editor and chat",
  async run() {
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
          additionalSkillPaths: [resolve(rootDir, "skills")],
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
      sessionManager: SessionManager.create(process.cwd()),
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
