import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

interface SessionEntry {
  type: string;
  id: string;
  parentId: string | null;
  timestamp: string;
  message?: {
    role: string;
    content: string | Array<{ type: string; text?: string }>;
    timestamp: number;
  };
  summary?: string;
}

interface TranscriptMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Transcript {
  sessionFile: string;
  sessionId: string;
  cwd: string;
  model?: string;
  messages: TranscriptMessage[];
}

function parseSessionFile(filePath: string): SessionEntry[] {
  const content = readFileSync(filePath, "utf-8");
  const entries: SessionEntry[] = [];
  const lines = content.trim().split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line));
    } catch {
      // Skip malformed lines
    }
  }
  return entries;
}

function extractTextContent(content: string | Array<{ type: string; text?: string }>): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text!)
      .join("");
  }
  return "";
}

function buildTranscript(entries: SessionEntry[], sessionFile: string): Transcript {
  const sessionId = entries[0]?.id || "unknown";
  const cwd = entries[0]?.type === "session" ? (entries[0] as any).cwd || "" : "";

  // Extract model from model_change entries
  const modelEntry = entries.find((e) => e.type === "model_change");
  const model = modelEntry ? `${(modelEntry as any).provider}/${(modelEntry as any).modelId}` : undefined;

  const messages: TranscriptMessage[] = [];

  for (const entry of entries) {
    if (entry.type === "message" && entry.message) {
      const msg = entry.message;
      if (msg.role === "user") {
        messages.push({
          role: "user",
          content: extractTextContent(msg.content),
        });
      } else if (msg.role === "assistant") {
        messages.push({
          role: "assistant",
          content: extractTextContent(msg.content),
        });
      } else if (msg.role === "system") {
        messages.push({
          role: "system",
          content: extractTextContent(msg.content),
        });
      } else if (msg.role === "compactionSummary") {
        messages.push({
          role: "assistant",
          content: `[Compacted: ${msg.summary || "context summary"}]`,
        });
      } else if (msg.role === "branchSummary") {
        messages.push({
          role: "assistant",
          content: `[Branch summary: ${msg.summary || "branch context"}]`,
        });
      }
      // Skip tool calls, tool results, thinking level changes, etc.
    }
  }

  return {
    sessionFile,
    sessionId,
    cwd,
    model,
    messages,
  };
}

export async function transcript(customDir?: string): Promise<void> {
  const sessionsPath = resolve(process.cwd(), ".sessions");
  const targetDir = customDir || resolve(process.cwd(), "docs", "transcripts");

  if (!existsSync(sessionsPath)) {
    console.log("No .sessions directory found.");
    process.exit(0);
  }

  const sessionFiles = readdirSync(sessionsPath)
    .filter((f) => f.endsWith(".jsonl"))
    .sort();

  let created = 0;
  let skipped = 0;

  for (const fileName of sessionFiles) {
    const sessionFile = resolve(sessionsPath, fileName);
    const transcriptFile = resolve(targetDir, fileName.replace(".jsonl", ".json"));

    if (existsSync(transcriptFile)) {
      skipped++;
      continue;
    }

    try {
      const entries = parseSessionFile(sessionFile);
      if (entries.length === 0) {
        skipped++;
        continue;
      }

      const transcript = buildTranscript(entries, sessionFile);
      writeFileSync(transcriptFile, JSON.stringify(transcript, null, 2), "utf-8");
      created++;
    } catch (err) {
      console.error(`Error processing ${fileName}: ${err}`);
    }
  }

  if (!existsSync(targetDir)) {
    console.log(`Created ${targetDir}`);
  }

  console.log(`Created ${created} transcript(s), skipped ${skipped} (already exists or empty)`);
}
