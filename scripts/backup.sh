#!/bin/bash
# backup.sh - Dump Postgres database using pg_dump

set -euo pipefail

pg_dump -U "$USER" -F c -f backup.dump
