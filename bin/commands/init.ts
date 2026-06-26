import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const DOCKERFILE = resolve(__dirname, "../..", "Dockerfile");

export async function init(): Promise<void> {
  const folderName = process.cwd().split("/").pop()!;

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
