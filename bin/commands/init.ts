import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const rootDir = resolve(__dirname, "..");
const SKILLS_DIR = resolve(rootDir, "..", "skills");
const DOCKERFILE = resolve(__dirname, "../..", "Dockerfile");
const CONFIG_PATH = resolve(process.cwd(), "anvil.json");
const GITIGNORE_PATH = resolve(process.cwd(), ".gitignore");
const SESSIONS_DIR = ".sessions";

const DEFAULT_CONFIG = JSON.stringify(
  {
    $schema: "https://raw.githubusercontent.com/ldsp91/anvil/main/anvil.schema.json",
    model: "claude-sonnet-4-6",
    maxIterations: 5,
  },
  null,
  2,
);

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

  const skillDirs = readdirSync(skillsSrc)
    .filter((d) => statSync(resolve(skillsSrc, d)).isDirectory());

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

export async function init(): Promise<void> {
  const folderName = process.cwd().split("/").pop()!;

  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, DEFAULT_CONFIG, "utf-8");
    console.log(`Created ${CONFIG_PATH}`);
  }

  // Create .sessions directory for session storage
  const sessionsPath = resolve(process.cwd(), SESSIONS_DIR);
  if (!existsSync(sessionsPath)) {
    mkdirSync(sessionsPath, { recursive: true });
    console.log(`Created ${sessionsPath}`);
  }

  // Create docs/transcripts directory
  const docsTranscriptsPath = resolve(process.cwd(), "docs", "transcripts");
  if (!existsSync(docsTranscriptsPath)) {
    mkdirSync(docsTranscriptsPath, { recursive: true });
    console.log(`Created ${docsTranscriptsPath}`);
  }

  // Add .sessions to .gitignore if not already present
  if (!existsSync(GITIGNORE_PATH)) {
    writeFileSync(GITIGNORE_PATH, "", "utf-8");
  }
  const gitignoreContent = readFileSync(GITIGNORE_PATH, "utf-8");
  if (!gitignoreContent.includes(SESSIONS_DIR)) {
    writeFileSync(GITIGNORE_PATH, gitignoreContent + `\n${SESSIONS_DIR}\n`, "utf-8");
    console.log(`Added ${SESSIONS_DIR} to .gitignore`);
  }

  await cloneAndCopySkills();

  try {
    Bun.spawnSync(
      ["docker", "image", "inspect", `sandcastle:${folderName}`],
      { stdio: ["ignore"] },
    );

    console.log(
      `Removing old Docker image ${`sandcastle:${folderName}`} via npx sandcastle docker remove-image`,
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
      `Docker image sandcastle:${folderName} doesn't exist yet... Proceed`,
    );
  }

  console.log(`Building Docker image from ${DOCKERFILE}...`);

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
}
