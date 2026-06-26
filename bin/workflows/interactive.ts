import { Workflow } from "./types.js";
import {
  AuthStorage,
  ModelRegistry,
  SessionManager,
  createAgentSession,
} from "@earendil-works/pi-coding-agent";

function createReadline(): Promise<string> {
  return new Promise((resolve) => {
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("", (answer: string) => {
      rl.close();
      resolve(answer);
    });
  });
}

export const interactiveWorkflow: Workflow = {
  id: "interactive",
  name: "Interactive",
  description: "Continuous interactive Pi session with readline",
  async run() {
    const authStorage = AuthStorage.create();
    const modelRegistry = ModelRegistry.create(authStorage);

    const { session } = await createAgentSession({
      sessionManager: SessionManager.inMemory(),
      authStorage,
      modelRegistry,
    });

    // Stream output to terminal
    session.subscribe((event) => {
      if (
        event.type === "message_update" &&
        event.assistantMessageEvent.type === "text_delta"
      ) {
        process.stdout.write(event.assistantMessageEvent.delta);
      }
      if (
        event.type === "message_update" &&
        event.assistantMessageEvent.type === "thinking_delta"
      ) {
        process.stdout.write(event.assistantMessageEvent.delta);
      }
    });

    console.log("Pi Interactive Session (type 'exit' to quit)\n");

    try {
      while (true) {
        const input = await createReadline();

        if (input.trim().toLowerCase() === "exit") {
          console.log("\nGoodbye!");
          break;
        }

        if (!input.trim()) continue;

        await session.prompt(input);
        console.log();
      }
    } finally {
      session.dispose();
    }
  },
};
