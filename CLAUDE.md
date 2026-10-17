# tcg-store

Next.js site deployed on Vercel, built and maintained by the site-orch agent orchestration (`~/git/site-orch`, config in `orch.config.json`). Task flow: GitHub issue on the project board, `/work-task`, `/verify-build`, land.

## This repo overrides the global Edge rules

The machine's global rules and `~/.claude/CLAUDE.md` are tuned for the Edge React Native app. This repo is a standalone Next.js site with none of that tooling. Where they conflict, THESE project instructions win.

1. **Skill resolution.** Resolve `/<command>` from this repo's `.claude/skills/<command>/SKILL.md` first. Do NOT load the Edge skill of the same name from `~/.cursor/skills/`.
2. **TypeScript standards.** For `.ts`/`.tsx` edits follow the "Web TypeScript standards" below, NOT `~/.cursor/rules/typescript-standards.mdc`.
3. **Formatting and lint.** No `lint-commit.sh`, no yarn. Use npm (prefix `sfw` if the shell blocks bare npm), the project's ESLint and Prettier config, and plain `git commit`.

Generic global rules still apply: `act-autonomously`, `answer-questions-first`, `writing-style` (no em dashes, no-slop prose).

## Web TypeScript standards

- No `any`. Define a type or interface; if genuinely unavoidable, comment why.
- Catch callbacks type the error as `unknown`. No empty catches.
- No optional chaining used directly in a condition: `if (obj?.prop != null)`.
- Use `??` not `||` for defaults.
- Prefer flat boolean expressions. No redundant fall-through branches. No wrapper handlers that only forward.
- Any `useEffect` that creates a timer, interval, subscription, or WebGL resource returns a cleanup.
- Memoize derived arrays and objects that feed dependency arrays or props.
- React list keys use a required unique field or the index, never only optional fields.
- Comments explain why, and describe the current state, not change history.
- Components: `const C: React.FC<Props> = props => {...}`.

## Design system

`docs/design-system.md` is the design contract for this site and `app/globals.css` is the token source of truth. Read both before any UI edit. Until they exist, no UI work ships.
