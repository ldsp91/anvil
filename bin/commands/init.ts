export async function init(): Promise<void> {
  const folderName = process.cwd().split("/").pop()!;

  try {
    Bun.spawnSync(["docker", "image", "inspect", `sandcastle:${folderName}`], {
      stdio: "ignore",
    });

    console.log(
      `Removing old Docker image ${`sandcastle:${folderName}`} via npx sandcastle docker remove-image`,
    );

    Bun.spawnSync(
      [
        "sh",
        "-c",
        `docker ps -a --filter ancestor=sandcastle:${folderName} -q | xargs -r docker rm -f`,
      ],
      { stdio: "inherit" },
    );

    Bun.spawnSync(["npx", "sandcastle", "docker", "remove-image"], {
      stdio: "inherit",
    });
  } catch {
    console.log(`Docker image doesn't exist yet... Proceed`);
  }
}
