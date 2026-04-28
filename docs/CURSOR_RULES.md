## Cursor Rules (Project Enforcement)

These rules are **mandatory** for all development in this repository.

### Core Principles

- **Do not expand scope**: Only implement what is explicitly requested or specified.
- **Keep implementations minimal**: Prefer the simplest working solution.
- **Avoid overengineering**: No new architecture patterns unless explicitly required.
- **Work in small, working steps**: Each step should leave the app in a runnable state.
- **No functionality drift**: Do not change existing behavior unless the task requires it.

### Change Discipline

- **No refactors by default**: Avoid “cleanup” changes unrelated to the current task.
- **No drive-by edits**: If you touch a file, keep changes limited to what’s needed.
- **Be explicit about what changed**: Summarize changes in the PR/commit message or chat update.

### Quality Gates (Before Major Features Are Considered Complete)

- **Build passes**: `npm run build`
- **TypeScript strict passes** (when configured): no type errors
- **No unused code**: remove dead exports, unreachable code, and unused components
- **No feature drift**: confirm the implemented UI/UX still matches the spec

### Project Styling & UX Guardrails

- **Maintain the Arkadians brand system**: navy/gold/cream palette, premium spacing, concierge language.
- **Consistency over novelty**: use existing components/patterns before introducing new ones.

