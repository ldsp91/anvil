import {
    copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync
} from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { color, divider, running, status, TAGLINE } from '../styles.js';
import { listWorkflows } from '../workflows/registry.js';

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const rootDir = resolve(__dirname, "..");
const SKILLS_DIR = resolve(rootDir, "..", "skills");
const DOCKERFILE = resolve(__dirname, "../..", "Dockerfile");
const CONFIG_PATH = resolve(process.cwd(), "anvil.json");
const GITIGNORE_PATH = resolve(process.cwd(), ".gitignore");
const SESSIONS_DIR = ".sessions";
const DOCS_AGENTS_SRC = resolve(rootDir, "..", "docs", "agents");
const DOCS_AGENTS_DST = resolve(process.cwd(), "docs", "agents");

/**
 * Generate default config with all workflow IDs pre-filled in the nested models object.
 */
function getDefaultConfig(): string {
  const workflows = listWorkflows();
  const workflowModels: Record<string, string> = {};
  
  // Pre-fill all workflow IDs with empty strings (except interactive)
  for (const workflow of workflows) {
    if (workflow.id !== 'interactive') {
      workflowModels[workflow.id] = '';
    }
  }
  
  return JSON.stringify(
    {
      $schema:
        "https://raw.githubusercontent.com/ldsp91/anvil/main/anvil.schema.json",
      maxIterations: 5,
      models: {
        workflows: workflowModels,
        subagents: {},
      },
    },
    null,
    2,
  );
}

/**
 * Update existing anvil.json config with any missing workflow IDs.
 * Supports both the new nested structure and the legacy flat structure.
 * Returns the updated config object, or undefined if nothing changed.
 */
function updateConfigWorkflows(): Record<string, any> | undefined {
  try {
    const raw = readFileSync(CONFIG_PATH, "utf-8");
    const config = JSON.parse(raw);
    
    if (!config || typeof config !== 'object') {
      return undefined;
    }
    
    // Normalize legacy flat models → nested structure
    if (config.models && typeof config.models === 'object' && !Array.isArray(config.models)) {
      const keys = Object.keys(config.models);
      // If keys look like workflow IDs (no "workflows" or "subagents" key), treat as legacy flat
      if (!config.models.workflows && !config.models.subagents) {
        config.models = {
          workflows: config.models as Record<string, string>,
          subagents: {},
        };
      }
    }
    
    // Initialize nested models object if it doesn't exist
    if (!config.models) {
      config.models = { workflows: {}, subagents: {} };
    }
    if (!config.models.workflows) {
      config.models.workflows = {};
    }
    if (!config.models.subagents) {
      config.models.subagents = {};
    }
    
    const workflows = listWorkflows();
    let changed = false;
    
    // Add any missing workflow IDs
    for (const workflow of workflows) {
      if (workflow.id !== 'interactive' && !config.models.workflows[workflow.id]) {
        config.models.workflows[workflow.id] = '';
        changed = true;
      }
    }
    
    return changed ? config : undefined;
  } catch {
    return undefined;
  }
}

function copyDirSync(src: string, dst: string): void {
  const stat = statSync(src);
  if (stat.isDirectory()) {
    if (!existsSync(dst)) {
      mkdirSync(dst, { recursive: true });
    }
    for (const entry of readdirSync(src)) {
      copyDirSync(resolve(src, entry), resolve(dst, entry));
    }
  } else {
    copyFileSync(src, dst);
  }
}

async function cloneAndCopySkills(): Promise<void> {
  const tmpDir = resolve(rootDir, "..", ".tmp-skills-clone");

  if (existsSync(tmpDir)) {
    rmSync(tmpDir, { recursive: true, force: true });
  }

  console.log("Cloning mattpocock/skills...");
  Bun.spawnSync(
    ["git", "clone", "https://github.com/mattpocock/skills", tmpDir],
    { stdio: ["inherit"] },
  );

  const skillsSrc = resolve(tmpDir, "skills");
  if (!existsSync(skillsSrc)) {
    console.error("Error: skills/ subfolder not found in cloned repo");
    rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }

  if (!existsSync(SKILLS_DIR)) {
    mkdirSync(SKILLS_DIR, { recursive: true });
  }

  const skillDirs = readdirSync(skillsSrc).filter((d) =>
    statSync(resolve(skillsSrc, d)).isDirectory(),
  );

  for (const skillName of skillDirs) {
    const src = resolve(skillsSrc, skillName);
    const dst = resolve(SKILLS_DIR, skillName);
    if (existsSync(dst)) {
      rmSync(dst, { recursive: true, force: true });
    }
    copyDirSync(src, dst);
    console.log(`  Copied skill: ${skillName}`);
  }

  rmSync(tmpDir, { recursive: true, force: true });
  console.log(`Installed ${skillDirs.length} skills to ${SKILLS_DIR}`);
}

export async function setup(): Promise<void> {
  const folderName = process.cwd().split("/").pop()!;

  console.log(TAGLINE);
  console.log("");
  console.log(running(`Initializing project: ${color(folderName, "cyan")}`));
  console.log("  " + divider());
  console.log("");

  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, getDefaultConfig(), "utf-8");
    console.log(status(`Created ${color(CONFIG_PATH, "magenta")}`));
  } else {
    // Update existing config with any missing workflow IDs
    const updated = updateConfigWorkflows();
    if (updated) {
      writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf-8");
      console.log(status(`Updated ${color(CONFIG_PATH, "magenta")} with new workflow(s)`));
    }
  }

  // Create .sessions directory for session storage
  const sessionsPath = resolve(process.cwd(), SESSIONS_DIR);
  if (!existsSync(sessionsPath)) {
    mkdirSync(sessionsPath, { recursive: true });
    console.log(status(`Created ${color(sessionsPath, "magenta")}`));
  }

  // Create docs/transcripts directory
  const docsTranscriptsPath = resolve(process.cwd(), "docs", "transcripts");
  if (!existsSync(docsTranscriptsPath)) {
    mkdirSync(docsTranscriptsPath, { recursive: true });
    console.log(status(`Created ${color(docsTranscriptsPath, "magenta")}`));
  }

  // Copy docs/agents/ from anvil package if not already present
  if (existsSync(DOCS_AGENTS_SRC) && !existsSync(DOCS_AGENTS_DST)) {
    copyDirSync(DOCS_AGENTS_SRC, DOCS_AGENTS_DST);
    console.log(status(`Copied ${color("docs/agents/", "magenta")} from anvil package`));
  }

  // Add .sessions to .gitignore if not already present
  if (!existsSync(GITIGNORE_PATH)) {
    writeFileSync(GITIGNORE_PATH, "", "utf-8");
  }
  const gitignoreContent = readFileSync(GITIGNORE_PATH, "utf-8");
  if (!gitignoreContent.includes(SESSIONS_DIR)) {
    writeFileSync(
      GITIGNORE_PATH,
      gitignoreContent + `\n${SESSIONS_DIR}\n`,
      "utf-8",
    );
    console.log(status(`Added ${color(SESSIONS_DIR, "yellow")} to .gitignore`));
  }

  console.log("");
  console.log(running(`Cloning skill packs from mattpocock/skills...`));
  await cloneAndCopySkills();

  console.log("");
  try {
    Bun.spawnSync(["docker", "image", "inspect", `sandcastle:${folderName}`], {
      stdio: ["ignore"],
    });

    console.log(
      running(
        `Removing old Docker image ${color(`sandcastle:${folderName}`, "yellow")}`,
      ),
    );

    Bun.spawnSync(
      [
        "sh",
        "-c",
        `docker ps -a --filter ancestor=sandcastle:${folderName} -q | xargs -r docker rm -f`,
      ],
      { stdio: ["inherit"] },
    );

    Bun.spawnSync(["npx", "sandcastle", "docker", "remove-image"], {
      stdio: ["inherit"],
    });
  } catch {
    console.log(
      `  ℹ  Docker image ${color(`sandcastle:${folderName}`, "yellow")} doesn't exist yet... Proceeding`,
    );
  }

  console.log("");
  console.log(
    running(`Building Docker image from ${color("Dockerfile", "magenta")}...`),
  );
  console.log("");

  Bun.spawnSync(
    [
      "docker",
      "build",
      "-t",
      `sandcastle:${folderName}`,
      "-f",
      DOCKERFILE,
      ".",
    ],
    { stdio: ["inherit"], cwd: process.cwd() },
  );

  console.log("");
  console.log(status(`Project initialized successfully!`));
  console.log("");
}
