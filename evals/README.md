# Evals

`npm test` proves the plugin is *shaped* right: manifests agree, commands the pages promise
exist, skills look for third-party audits in every directory an installer uses. None of that
says the skills *behave*.

These cases do. They run the real plugin against a real model with `claude plugin eval`, which
also runs a no-plugin baseline arm so a passing score means the plugin did something a bare
model would not:

```bash
claude plugin eval ./plugin
claude plugin eval ./plugin --case start-stops-without-audits
```

## Getting the command to run

`plugin eval` is early access, rolled out per organization. Where the rollout has not reached —
and that includes CI runners — it is enabled with an environment variable:

```bash
CLAUDE_CODE_WALNUT_SPIRE=1 claude plugin eval .
```

Set it in the shell, or in `~/.claude/settings.json` under `env`. Not in this repository's
`.claude/settings.json`: a committed value normally leaves the command gated off anyway.

Run from the repository root, not from `plugin/` — cases are discovered under the target you
name, and they live here.

**Not in CI.** Every run costs model time and hits the network, so this stays a deliberate
command.

## Shape of a case

A directory with `prompt.md` (frontmatter: `max_turns`, `allowed_tools`) and `graders/*.md`
(frontmatter: `type`, `weight`). The cases below encode failures that already happened, not
hypotheticals — the same rule the pages follow.
