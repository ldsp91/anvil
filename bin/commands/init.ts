import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const DOCKERFILE = resolve(__dirname, "../..", "Dockerfile");
const CONFIG_PATH = resolve(process.cwd(), "anvil.json");

const DEFAULT_CONFIG = JSON.stringify(
  {
    $schema: "https://raw.githubusercontent.com/ldsp91/anvil/main/anvil.schema.json",
    model: "claude-sonnet-4-6",
    maxIterations: 5,
  },
  null,
  2,
);

export async function init(): Promise<void> {
  const folderName = process.cwd().split("/").pop()!;

  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, DEFAULT_CONFIG, "utf-8");
    console.log(`Created ${CONFIG_PATH}`);
  }

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
