#!/usr/bin/env bash
set -euo pipefail

# Generates a filled PR-review prompt for the current local branch (compared to 'develop').
# Output the repository prompt template then append local metadata (files, commits, diff, test/build snippets).
# Usage: ./scripts/fill-pr-review-prompt.sh > prompt-for-copilot.txt

# Determine a sensible base branch: prefer develop, then main, then origin/main, else use merge-base
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
if [ -z "$BRANCH" ]; then
  echo "Error: cannot determine current git branch" >&2
  exit 1
fi

if git show-ref --verify --quiet refs/heads/develop; then
  BASE="develop"
elif git show-ref --verify --quiet refs/heads/main; then
  BASE="main"
elif git ls-remote --exit-code origin main >/dev/null 2>&1; then
  BASE="origin/main"
else
  # fallback to common ancestor with origin/main or HEAD
  BASE="$(git merge-base --fork-point HEAD origin/main 2>/dev/null || git merge-base --all HEAD HEAD)"
fi
if [ -z "$BRANCH" ]; then
  echo "Error: cannot determine current git branch" >&2
  exit 1
fi

TEMPLATE=".github/pr-reviewer-prompt.md"
if [ ! -f "$TEMPLATE" ]; then
  echo "Error: missing template $TEMPLATE" >&2
  exit 1
fi

# Collect VCS info
FILES_CHANGED="$(git diff --name-only "$BASE...$BRANCH" 2>/dev/null || git diff --name-only "$BASE..$BRANCH" 2>/dev/null || echo "(no changes)")"
COMMITS="$(git --no-pager log --oneline "$BASE..$BRANCH" 2>/dev/null || echo "(no commits)")"
DIFF="$(git diff --unified=3 "$BASE...$BRANCH" 2>/dev/null | sed -n '1,800p' || git diff --unified=3 "$BASE..$BRANCH" 2>/dev/null | sed -n '1,800p' || echo "(no diff)")"

# Run tests/build but do not fail the script if they fail; capture output
TEST_OUTPUT="$(npm run test -- --run --silent 2>&1 || true)"
BUILD_OUTPUT="$(npm run build --silent 2>&1 || true)"

# Print template then contextual metadata sections
echo "---- PROMPT TEMPLATE BEGIN ----"
cat "$TEMPLATE"
echo "---- PROMPT TEMPLATE END ----"
echo
echo "### CONTEXTO LOCAL (autogenerado)"
echo "PR_URL: LOCAL_BRANCH:$BRANCH"
echo "PR_HEAD: $BRANCH"
echo "PR_BASE: $BASE"
echo
echo "### FILES_CHANGED"
echo "$FILES_CHANGED"
echo
echo "### COMMITS"
echo "$COMMITS"
echo
echo "### DIFF (truncated to 800 lines)"
echo "$DIFF"
echo
echo "### TEST OUTPUT (truncated)"
echo "$TEST_OUTPUT" | sed -n '1,200p'
echo
echo "### BUILD OUTPUT (truncated)"
echo "$BUILD_OUTPUT" | sed -n '1,200p'
