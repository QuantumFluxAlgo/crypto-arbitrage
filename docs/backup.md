# Postgres Backup and Restore Guide

Follow these steps to safeguard your database and quickly recover from failures.

---

## Backup with `pg_dump`

1. Log in to the server hosting Postgres.
2. Run the following command to create a compressed backup:

   ```bash
   pg_dump -U arb -F c -f backup.dump
   ```
   - `-U arb` uses the `arb` user.
   - `-F c` outputs in custom format for faster restores.
   - `-f backup.dump` specifies the backup file path.

3. Store `backup.dump` in a secure location (e.g. off-site storage or encrypted bucket).

---

## Restore with `pg_restore`

1. Ensure the destination database `arbdb` exists or create it with `createdb arbdb`.
2. Run the restore command:

   ```bash
   pg_restore -U arb -d arbdb backup.dump
   ```
   - `-d arbdb` is the target database.
   - The existing data will be overwritten if the schema already exists.

3. Verify the tables and data once the command completes.

---

## Automate Daily Backups with Cron

1. Edit the crontab for the `arb` user:

   ```bash
   crontab -e
   ```

2. Add a daily job that runs at 02:00 each morning:

   ```cron
   0 2 * * * pg_dump -U arb -F c -f /path/to/backups/$(date +\%F).dump
   ```

   - Adjust the path to your desired backup directory.
   - Old backups should be rotated or pruned to save space.

3. Save the cron file. The system will automatically run the command every day.

---

## Best Practices

- Encrypt backups if they contain sensitive data.
- Keep multiple copies in separate locations.
- Regularly test the restore procedure to ensure backups work.
- Monitor cron jobs and disk usage to prevent silent failures.


