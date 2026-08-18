# Commits

English, one line, lower case, imperative. The subject says what the commit does, not what
the author did to it.

```
plugin: find third-party audits in every install directory
content: drop the staging jargon from the robots.txt step
ci: split build from deploy so npm never sees the ssh key
```

- **Prefix by area**: `content`, `plugin`, `ci`, `docs`, `style`, `deps`, `fix`. A scope in
  parentheses when it narrows something real — `fix(mermaid)`, not `fix(stuff)`.
- **Under 72 characters.** If the subject does not fit, the commit is usually two commits.
- **A body only when the reason is not in the diff.** Someone else's bug being worked
  around, an outside requirement, a decision that looks wrong without context. Not a
  changelog of the files touched — `git show` prints those.
- **No dates, ticket numbers or run links** in the subject. They age badly and the commit
  already carries a date.

Pull request titles follow the same rule. The description carries the why.
