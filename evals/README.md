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

**They do not run in CI.** The command is in early access and not enabled on this account, and
each run costs model time and hits the network. When access lands, the cases are already here.

Each case is a directory: `prompt.md` is what the user says, `graders/*.md` is what the answer
has to satisfy. The cases below encode failures that already happened, not hypotheticals — that
is the same rule the pages follow.
