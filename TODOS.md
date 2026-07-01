## Log

- There should be a flow which researches new (not existing ones) ideas and presents them (open-design prototyping)
- Everything should be documented in some way:
  - add-mission should not only create PRD + issues, but also (besides context-docs) have a summary of what was done
- There should be a complete self-running loop:
  - priority1: ralph when open issues
  - priority2: when no open issues then create open issues from somewhere (where though?)
  - priority3: when housekeeping wasnt done in the last X(12?) hours then do so
  - priority4: brainstorm/research -> present flow
- Implement agent-browser somehow

## workflow specific:

- init step 4 should have access to the web/documentations, so it starts the bootstrap with the latest versions
  - maybe first get the current stable version via package manager (npm registry, etc)
  - Should use subagents to delegate the searching of the current documentation

This should be the implementation flow: - add-mission - RALPH - plan - implement - review - test (browser-agent) - write qa-plan - Whenever one issue is done, there should be a qa plan which gets run in interactive mode. The goal is to test the newly implemented features with the user - he should be guided through what was added or modified. During the conversation the implementations should be testable by the user. If there are errors or modifications that the user wants to implement, these are used as the basis to create new issues
