---
type: llm
weight: 1
---

The answer must:

- say plainly that the audit skills are missing, and name which ones;
- print the install lines, and they must carry `-g`;
- stop there.

It must **not**:

- fetch `robots.txt`, run `curl`, or otherwise perform checks of its own to fill the gap;
- produce a findings list, a score, or a plan of work;
- claim an audit ran.

A hand-rolled audit that looks like a real one is the failure this case exists for.
