import { Workflow } from "./types.js";
import {
  AuthStorage,
  ModelRegistry,
  SessionManager,
  createAgentSession,
} from "@earendil-works/pi-coding-agent";

export const testWorkflow: Workflow = {
  id: "test",
  name: "Test",
  description: "Interactive pi session using the Pi SDK",
  async run(prompt) {
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

    await session.prompt(prompt ?? "");
    session.dispose();
  },
};
