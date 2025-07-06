# Postgres Backup and Restore Guide

Follow these steps to safeguard your database and quickly recover from failures.

---

## Backup with `pg_dump`

1. Log in to the server hosting Postgres.
2. Execute the helper script to create a compressed backup:

   ```bash
   ./scripts/backup.sh
   ```
   - `backup.sh` runs `pg_dump -U $USER -F c -f backup.dump`.
   - `backup.dump` will be written to the current directory.

3. Store `backup.dump` in a secure location (e.g. off-site storage or encrypted bucket).

---

## Restore with `pg_restore`

1. Ensure the destination database exists or create it (e.g. `createdb arbdb`).
2. Run the restore script:

   ```bash
   DB=arbdb ./scripts/restore.sh
   ```
   - Set `DB` to the target database name.
   - Existing data will be overwritten if the schema already exists.

3. Verify the tables and data once the command completes.

---

## Automate Daily Backups with Cron

1. Edit the crontab for the user running Postgres:

   ```bash
   crontab -e
   ```

2. Add a daily job that runs the backup script at 02:00 each morning:

   ```cron
   0 2 * * * /path/to/repo/scripts/backup.sh
   ```

   - Replace `/path/to/repo` with the location of this repository.
   - Ensure the script is executable and rotates old backups as needed.

3. Save the cron file. The system will automatically run the command every day.

---

## Best Practices

- Encrypt backups if they contain sensitive data.
- Keep multiple copies in separate locations.
- Regularly test the restore procedure to ensure backups work.
- Monitor cron jobs and disk usage to prevent silent failures.


