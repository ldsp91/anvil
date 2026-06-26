export function help(): void {
  console.log(`
anvil - AI Agent CLI

Usage:
  anvil <prompt>
  anvil init

Options:
  --help    Show this help message

Example:
  anvil "Refactor the auth module to use JWT"
    `);
}
