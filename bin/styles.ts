/**
 * Terminal styling utilities — ANSI colors and formatting helpers.
 */

// ── Color constants (top-level for easy use) ────────────────────────────────
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const ITALIC = "\x1b[3m";
const UNDERLINE = "\x1b[4m";
const STRIKE = "\x1b[9m";

const BLACK = "\x1b[30m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";
const WHITE = "\x1b[37m";
const GRAY = "\x1b[90m";

// ── Helpers ─────────────────────────────────────────────────────────────────
export function color(text: string, ...codes: string[]): string {
  if (codes.length === 0) return text;
  const fg: Record<string, string> = {
    black: BLACK,
    red: RED,
    green: GREEN,
    yellow: YELLOW,
    blue: BLUE,
    magenta: MAGENTA,
    cyan: CYAN,
    white: WHITE,
    gray: GRAY,
  };
  const prefix = codes.map((c) => fg[c] ?? "").join("");
  return `${prefix}${text}${RESET}`;
}

// ── Unicode symbols ─────────────────────────────────────────────────────────
const SYM = {
  arrow: "▸",
  check: "✔",
  cross: "✖",
  lock: "🔒",
  star: "◆",
  separator: "─",
  corner: "╮",
  header: "▓",
  bullet: "●",
  note: "ℹ",
  fire: "🔥",
  sparkle: "✦",
  hammer: "⚒",
  anvil: "⚙",
} as const;

export const TAGLINE = `  ${DIM}┃${RESET}  ${DIM}AI Agent CLI with workflow system${RESET}`;

// ── Workflow card ───────────────────────────────────────────────────────────
export function workflowCard(
  index: number,
  name: string,
  description: string,
  locked: boolean,
  isLast: boolean,
): string {
  const num = String(index + 1).padStart(2, " ");
  const status = locked
    ? `${GRAY}${SYM.lock}${RESET} `
    : `${GREEN}${SYM.check}${RESET} `;
  const dimmed = locked ? `${DIM}̶${RESET} ` : "";
  const border = isLast ? GRAY : "";

  const lines = [
    `${border}  ${status}${BOLD}${num}. ${name}${RESET}`,
    `     ${dimmed}${description}${locked ? ` ${GRAY}(${SYM.lock} requires init)${RESET}` : ""}${RESET}`,
  ];

  return lines.join("\n");
}

// ── Section divider ─────────────────────────────────────────────────────────
export function divider(label?: string): string {
  if (label) {
    return `  ${CYAN}${SYM.header}${RESET} ${BOLD}${CYAN}${label}${RESET}${DIM}${"─".repeat(40)}${RESET}`;
  }
  return `  ${DIM}${"─".repeat(50)}${RESET}`;
}

// ── Help output ─────────────────────────────────────────────────────────────
export function formatHelp(
  workflows: { id: string; name: string; description: string }[],
): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(
    `${BOLD}${CYAN}ANVIL${RESET}  ${DIM}AI Agent CLI with workflow system${RESET}`,
  );
  lines.push("");
  lines.push(`  ${BOLD}Usage${RESET}`);
  lines.push(
    `    ${BOLD}${YELLOW}anvil${RESET}                  ${DIM}Interactive workflow selector${RESET}`,
  );
  lines.push(
    `    ${BOLD}${YELLOW}anvil run${RESET} <workflow>   ${DIM}Run a specific workflow${RESET}`,
  );
  lines.push(
    `    ${BOLD}${YELLOW}anvil init${RESET}             ${DIM}Initialize project (config, skills, Docker)${RESET}`,
  );
  lines.push(
    `    ${BOLD}${YELLOW}anvil transcript${RESET}       ${DIM}Generate transcripts from sessions${RESET}`,
  );
  lines.push(
    `    ${BOLD}${YELLOW}anvil help${RESET}             ${DIM}Show this help${RESET}`,
  );
  lines.push("");
  lines.push(
    `  ${BOLD}${CYAN}${SYM.header}${RESET} ${BOLD}Available Workflows${RESET}${DIM}${"─".repeat(30)}${RESET}`,
  );

  for (const w of workflows) {
    const isInit = w.id === "init";
    const icon = isInit
      ? `${YELLOW}${SYM.fire}${RESET}`
      : `${MAGENTA}${SYM.sparkle}${RESET}`;
    lines.push(
      `    ${icon}  ${BOLD}${w.name}${RESET}  ${DIM}${w.description}${RESET}`,
    );
  }

  lines.push("");
  lines.push(
    `  ${BOLD}${CYAN}${SYM.header}${RESET} ${BOLD}Examples${RESET}${DIM}${"─".repeat(30)}${RESET}`,
  );
  lines.push(`    ${BOLD}${YELLOW}$${RESET} ${DIM}anvil${RESET}`);
  lines.push(
    `    ${BOLD}${YELLOW}$${RESET} ${DIM}anvil run interactive${RESET}`,
  );
  lines.push(`    ${BOLD}${YELLOW}$${RESET} ${DIM}anvil run init${RESET}`);
  lines.push(`    ${BOLD}${YELLOW}$${RESET} ${DIM}anvil transcript${RESET}`);
  lines.push("");

  return lines.join("\n");
}

// ── Status messages ─────────────────────────────────────────────────────────
export function status(msg: string): string {
  return `  ${GREEN}${SYM.check}${RESET} ${msg}`;
}

export function info(msg: string): string {
  return `  ${BLUE}${SYM.note}${RESET} ${msg}`;
}

export function error(msg: string): string {
  return `  ${RED}${SYM.cross}${RESET} ${RED}${msg}${RESET}`;
}

export function running(msg: string): string {
  return `  ${YELLOW}${SYM.arrow}${RESET} ${msg}`;
}
