#!/bin/bash
# restore.sh - Restore Postgres database from backup.dump
# Requires PG* env vars for credentials

set -euo pipefail

pg_restore -U "$USER" -d "$DB" backup.dump
