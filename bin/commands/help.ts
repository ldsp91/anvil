export function help(): void {
  console.log(`
anvil - AI Agent CLI with workflow system

Usage:
  anvil                  Interactive workflow selector
  anvil run <workflow>   Run a workflow
  anvil init             Initialize project
  anvil help             Show this help

Available workflows:
  test    Interactive pi session using the Pi SDK

Options:
  help    Show this help message

Example:
  anvil
  anvil run test
  anvil run test "Review my code"
    `);
}
