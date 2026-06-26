export function help(): void {
  console.log(`
anvil - AI Agent CLI with workflow system

Usage:
  anvil                  Interactive workflow selector
  anvil run <workflow>   Run a workflow
  anvil init             Initialize project
  anvil help             Show this help

Available workflows:
  interactive    Full Pi terminal UI with editor and chat

Options:
  help    Show this help message

Example:
  anvil
  anvil run interactive
    `);
}
