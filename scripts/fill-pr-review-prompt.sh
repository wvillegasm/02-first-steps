#!/usr/bin/env bash
set -euo pipefail

# Generates a filled PR-review prompt for the current local branch (compared to 'develop').
# Output the repository prompt template then append local metadata (files, commits, diff, test/build snippets).
# Usage: ./scripts/fill-pr-review-prompt.sh > prompt-for-copilot.txt

# Determine current branch
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
if [ -z "$BRANCH" ]; then
  echo "Error: cannot determine current git branch" >&2
  exit 1
fi

# Choose a reasonable target branch to compare against (prefer develop -> main)
if git ls-remote --exit-code origin develop >/dev/null 2>&1; then
  TARGET_BRANCH="develop"
else
  TARGET_BRANCH="main"
fi

# Resolve a merge-base between HEAD and the remote target branch; fall back to the ref name
BASE_REF="origin/$TARGET_BRANCH"
BASE="$(git merge-base HEAD "$BASE_REF" 2>/dev/null || true)"
if [ -z "$BASE" ]; then
  # fallback to local TARGET_BRANCH if origin/$TARGET_BRANCH doesn't exist locally
  if git show-ref --verify --quiet "refs/heads/$TARGET_BRANCH"; then
    BASE_REF="$TARGET_BRANCH"
  fi
  # try merge-base again, otherwise use the ref name directly for diffs
  BASE="$(git merge-base HEAD "$BASE_REF" 2>/dev/null || true)"
  if [ -z "$BASE" ]; then
    BASE="$BASE_REF"
  fi
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
