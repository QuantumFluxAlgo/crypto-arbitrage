#!/bin/bash

LOG="maven_cleanup.log"
> "$LOG"

echo "🔍 Checking for active Maven usage..." | tee -a "$LOG"

if grep -rq "mvn" . || [ -f "pom.xml" ] || [ -d ".mvn" ]; then
  echo "✅ Maven references found." | tee -a "$LOG"
  echo ">> Keeping Maven. Please address issues using Codex UI." | tee -a "$LOG"
  exit 0
else
  echo "❌ No active Maven usage detected. Cleaning up..." | tee -a "$LOG"

  # Remove Maven-related files and directories
  if [ -f "pom.xml" ]; then
    rm pom.xml
    echo "Removed pom.xml" >> "$LOG"
  fi

  if [ -d ".mvn" ]; then
    rm -rf .mvn
    echo "Removed .mvn directory" >> "$LOG"
  fi

  # Remove any Maven commands from GitHub Actions workflows
  find .github/workflows -type f -name "*.yml" \
    -exec sed -i.bak '/mvn/d' {} \; \
    -exec echo "Cleaned Maven from {}" >> "$LOG" \;

  # Remove Maven mentions from Codex prompts (if present)
  find codex/ -type f \
    -exec sed -i.bak '/Maven/d' {} \; \
    -exec echo "Cleaned Maven from Codex prompt: {}" >> "$LOG" \;

  echo "✅ Cleanup complete. Log saved to $LOG" | tee -a "$LOG"
fi

