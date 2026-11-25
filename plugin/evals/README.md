# Evals

`npm test` proves the plugin is *shaped* right: manifests agree, commands the pages promise
exist, skills look for third-party audits in every directory an installer uses. None of that
says the skills *behave*.

These cases do. They are written for `claude plugin eval`, which runs the real plugin against a
real model and also runs a no-plugin baseline arm, so a passing score means the plugin did something
a bare model would not.

## Running them

`plugin eval` is early access, rolled out per organization. How to enable and run it is covered by
the Claude Code documentation: <https://code.claude.com/docs/en/plugins>. Two points specific to this
repository: target the `plugin/` folder, not the repository root (pointed at the root, no plugin
resolves and every case silently scores the baseline), and keep the cases inside the plugin folder,
since the eval directory must live inside the plugin.

**Not in CI.** Every run costs model time and hits the network, so this stays a deliberate
command.

## Shape of a case

A directory with `prompt.md` (frontmatter: `max_turns`, `allowed_tools`) and `graders/*.md`
(frontmatter: `type`, `weight`). The cases below encode failures that already happened, not
hypotheticals — the same rule the pages follow.
