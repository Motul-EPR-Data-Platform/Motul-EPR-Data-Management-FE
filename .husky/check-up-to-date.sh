#!/bin/sh

echo "Checking if your branch is up to date..."

git fetch

if ! git rev-parse @{u} >/dev/null 2>&1; then
  echo "❌ No upstream configured for this branch."
  echo "👉 Please run: git push -u origin $(git branch --show-current)"
  exit 1
fi

LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "❌ Your branch is OUT OF DATE."
  echo "👉 Please run: git pull"
  exit 1
fi

echo "✅ Branch is up to date. Pushing..."
exit 0
