# anvil

**AI agent package with a pluggable workflow system** — built on top of [Pi Coding Agent](https://github.com/earendil-works/pi-coding-agent) and [Sandcastle](https://github.com/ai-hero-ai/sandcastle).

> Import `anvil` into your project to add AI agent workflows, session management, and transcript generation to your codebase.

## Features

- **Interactive workflow selector** — choose from available agent workflows at startup
- **Workflow system** — extensible registry of agent workflows with configurable skill loading
- **Session management** — automatic session tracking and transcript generation
- **Dockerized environment** — pre-configured Sandcastle image with all dependencies
- **Skill packs** — auto-clones and installs skills from [mattpocock/skills](https://github.com/mattpocock/skills)

## Installation

Add `anvil` to your project:

```bash
bun add anvil
```

Then run the CLI directly from your project root:

```bash
bunx anvil
```

## Usage

```
anvil                  Interactive workflow selector (prompts for selection)
anvil run <workflow>   Run a specific workflow
anvil init             Initialize project (config, skills, Docker image)
anvil transcript       Generate transcripts from session files
anvil help             Show help message
```

### Workflows

| ID | Name | Description |
|---|---|---|
| `interactive` | Interactive | Full Pi terminal UI with editor and chat |
| `init` | Init | 4-step initialization process to define your project |

### Initialization Workflow

The `init` workflow guides you through a structured, multi-step initialization process that creates markdown files to define what your project is about. Each step produces a file in `docs/`, and the workflow automatically detects which step you're on by checking which files already exist.

```bash
# Run the initialization workflow
anvil run init
```

Run `anvil run init` repeatedly — it always picks up where you left off.

#### Step Flow

| Step | Skill | Purpose | Output |
|------|-------|---------|--------|
| **1** | `1-init-grill` | YC Office Hours interrogation — nail down the core idea, problem, user, and wedge | `docs/PROJECT_BRIEF.md` |
| **2** | `2-prd` | Turn the validated brief into a structured PRD with features, user stories, scope, and success metrics | `docs/PRD.md` |
| **3** | `3-architecture` | Comprehensive architecture design — system, data, API, security, infra, frontend, backend, performance, scalability, reliability, testing, integrations, observability | `docs/ARCHITECTURE.md` |
| **4** | `4-bootstrap` | Read the architecture and plan the first implementation issues — repository structure, tooling, CI, dev environment, and scaffold (final step) | `docs/BOOTSTRAP_PLAN.md` |

### Examples

```bash
# Interactive mode — select a workflow
anvil

# Run the interactive workflow directly
anvil run interactive

# Run the initialization workflow
anvil run init

# Initialize a new project
anvil init

# Generate transcripts from recorded sessions
anvil transcript
```

## Configuration

Run `anvil init` to create an `anvil.json` config file:

```json
{
  "$schema": "https://raw.githubusercontent.com/ldsp91/anvil/main/anvil.schema.json",
  "model": "claude-sonnet-4-6",
  "maxIterations": 5
}
```

| Property | Type | Description |
|---|---|---|
| `model` | `string` | AI model to use (e.g. `claude-sonnet-4-6`, `gpt-4`) |
| `maxIterations` | `integer` | Maximum number of agent iterations (min: 1) |

## Project Structure

```
anvil/
├── bin/
│   ├── anvil.ts              # CLI entry point
│   ├── commands/
│   │   ├── help.ts           # Help command
│   │   ├── init.ts           # Project initialization
│   │   ├── interactive.ts    # Interactive workflow runner
│   │   ├── run.ts            # Workflow runner by ID
│   │   └── transcript.ts     # Session transcript generator
│   └── workflows/
│       ├── interactive.ts    # Interactive workflow definition
│       ├── registry.ts       # Workflow registry
│       └── types.ts          # Workflow type definitions
├── skills/                   # Auto-installed skill packs
├── .sessions/                # Session logs (auto-created by `init`)
├── docs/transcripts/         # Generated transcripts
├── anvil.json                # Project configuration
├── anvil.schema.json         # JSON Schema for anvil.json
├── Dockerfile                # Sandcastle Docker image
└── package.json
```

## Docker / Sandcastle

The `Dockerfile` creates a Sandcastle-compatible image with:

- **Node 25** + **Bun** + **uv** (Python toolchain)
- **GitHub CLI** (`gh`)
- **Chromium** (for browser automation)
- **Pi Coding Agent** (global install)
- Custom `pi-headroom` and `pi-vent` plugins

### Building

```bash
anvil init
```

This builds a Docker image tagged `sandcastle:<project-name>` from the Dockerfile.

### Running

Sandcastle bind-mounts your project at `/home/agent/workspace` inside the container. The entrypoint is `sleep infinity`, so you connect via `docker exec` or Sandcastle's sandbox mode.

## Adding Workflows

Workflows are defined in `bin/workflows/` and registered in `bin/workflows/registry.ts`:

```typescript
import { Workflow } from "./types.js";

export const myWorkflow: Workflow = {
  id: "my-workflow",
  name: "My Workflow",
  description: "What it does",
  skills: ["engineering/to-prd"],  // optional skill packs
  async run(prompt, options) {
    // Your agent session logic here
  },
};
```

Then add it to the `workflows` array in `registry.ts`.

## License

MIT
