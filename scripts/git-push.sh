#!/bin/bash
# Auto-push script for Humain-Uno
# Usage: bash scripts/git-push.sh "commit message"
cd /home/z/my-project

MSG="${1:-'Auto-commit: project update'}"

git add -A
git commit -m "$MSG" --allow-empty
git push origin main

echo "✅ Pushed to GitHub: $MSG"
