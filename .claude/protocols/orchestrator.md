# Orchestrator protocol

The `/orch` slash command runs this protocol. The main session acts as
orchestrator only — it reads, classifies, and dispatches. **The main session
does not edit code during a `/orch` run; all code changes go through specialist
agents.**

Required reading before step 1:

- `CLAUDE.md` (top-to-bottom on first /orch of the session; top-level skim
  thereafter)
- `.claude/knowledge/common-rules.md`
- `.claude/knowledge/gotchas.yaml`

Append an audit line to `.claude/orch-log.md` at the end of every run
(file is per-machine and gitignored).

---

## Step 1 — Classify the request

Into exactly one of:

- **question** — informational only; no file changes expected.
- **bug** — something works incorrectly; reproduce before fixing.
- **feature** — new capability or UI.
- **refactor** — restructure without behavior change.

The class determines whether step 5 dispatches a planner (`spec-writer` for
feature/refactor, `bug-triage` for bug) or dispatches a specialist directly
(for simple features/refactors), or answers inline (for question).

## Step 2 — Match gotchas

Walk `.claude/knowledge/gotchas.yaml`. For each entry, evaluate its `triggers`
(globs against likely-affected files, keywords against the request text plus
anticipated diff surface). List every matched gotcha id. Surface them to
every dispatched specialist in step 5+.

If zero gotchas match, proceed — but note the miss in the final synthesis
so the user can suggest a new gotcha if one belongs.

## Step 3 — Clarify (only if load-bearing)

Ask the user at most **one** question if the request is ambiguous on a
load-bearing axis (which scope, which locale, what constitutes done, which
route). Skip this step if the request is clear. Never wall-of-text.

## Step 4 — Judge domain scope

Single-domain or multi-domain. Ownership map:

- UI / tokens / components → `frontend-ui-specialist`
- Copy / i18n / messages / middleware routing → `content-i18n-specialist`
- `next.config.mjs` / package.json / deps / Amplify → `infra-deploy-specialist`

Multi-domain requests get a planner in step 5.

## Step 5a — Direct dispatch (single-domain, simple)

Dispatch the relevant specialist via the Agent tool. Prompt includes: the
request, matched gotcha ids (with rule text inlined), the DoD from
`common-rules.md`, and the explicit file list the specialist is allowed to
touch.

## Step 5b — Planner dispatch (multi-domain or non-trivial)

Dispatch `spec-writer` (feature/refactor) or `bug-triage` (bug). The planner
returns a DAG: nodes are specialist invocations, edges are dependencies.
The orchestrator then dispatches the DAG nodes (parallel where possible,
sequential where the edges require it).

## Step 6 — QA validation

After code-changing specialists report back, dispatch `qa-validator`. It runs
`pnpm exec tsc --noEmit` and `pnpm build`. It runs any `*.test.*` files found
under `tests/` or similar; it does NOT bootstrap a test framework that
doesn't already exist. Verbatim failures are returned to the orchestrator,
which may loop back to step 5 with a fix request.

## Step 7 — Security gate

Automatically dispatch `security-reviewer` when the diff touches any of:

- env vars (`.env*`, `process.env` references)
- any `'use client'` boundary change
- `next.config.mjs`
- `middleware.ts`
- form actions or server actions (none today, but watch for the first)
- `amplify.yml` (none today — if a file appears, gate fires)
- CSP / security headers
- secrets or tokens of any kind

Critical findings (confirmed secret leak, auth bypass, CSRF surface) block
step 8. High/medium findings are annotated in the PR description; low
findings are logged but not blocking.

## Step 8 — Dispatch git-workflow-specialist

Hand off the synthesis payload. The specialist:

1. Branches from `develop` by default; from `main` only when the
   orchestrator marks the payload `hotfix: true` (name:
   `<type>/<short-slug>` based on class, `hotfix/<short-slug>` for
   hotfixes).
2. Stages files explicitly by name (never `-A`).
3. Commits with a conventional-ish message.
4. Pushes the branch.
5. Opens a PR against `develop` by default; against `main` for hotfixes,
   via `gh pr create`. Does NOT enable auto-merge.

The specialist never merges the PR and never force-pushes.

Release PRs (`develop` → `main`) are human-initiated today; the specialist
does not cut releases.

---

## Hard rules

- Main session never directly edits code during `/orch`.
- Never `amplify publish`, `amplify deploy`, or any Amplify CLI command.
- Class `question` never produces a PR — answer inline and stop after step 2.
- Every `/orch` run appends one line to `.claude/orch-log.md`:
  `<iso-timestamp> | <class> | <gotchas matched> | <specialists dispatched> | <pr url or "no-pr">`.
- If any specialist reports a blocker it can't resolve, stop and surface to
  the user. Do not silently discard.
