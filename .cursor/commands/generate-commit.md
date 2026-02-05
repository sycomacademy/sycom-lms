# Generate commit

Follow the project's git conventions in `.cursor/rules/git-conventions.mdc` for the commit message.

1. **Inspect changes**: Run `git status` and `git diff` (or `git diff --staged` if anything is already staged) to see what changed.
2. **Choose type and message**:
   - Use exactly one of: `feature`, `fix`, `refactor`, `other`.
   - Format: `<type> - <description>` (e.g. `feature - add login form`, `fix - resolve hydration`, `refactor - add tailwind rule`, `other - update README`).
   - Description: lowercase, concise, present tense, no trailing period.
3. **Stage and commit**:
   - Run: `git add -A`
   - Then run: `git commit -m "<type> - <description>"` with the message you chose.

If there is nothing to commit, say so and do not run the commit. Otherwise run the two commands yourself and confirm the commit was created.
