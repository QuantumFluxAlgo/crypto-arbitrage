#!/bin/bash
# restore.sh - Restore Postgres database from backup.dump

set -euo pipefail

pg_restore -U "$USER" -d "$DB" backup.dump
