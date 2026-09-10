#!/bin/bash
# PostgreSQL backup script
# Usage: ./scripts/backup.sh [output-dir]
# Recommended: add to crontab: 0 3 * * * /app/scripts/backup.sh /backups

set -e

OUTPUT_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/hood_hotel}"
DB_NAME="hood_hotel"
RETENTION_DAYS=30

mkdir -p "$OUTPUT_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup of $DB_NAME..."

# Dump the database
pg_dump "$DB_URL" \
  --format=custom \
  --compress=9 \
  --file="$OUTPUT_DIR/${DB_NAME}_${TIMESTAMP}.dump" \
  --verbose 2>&1 | tail -5

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup complete: $OUTPUT_DIR/${DB_NAME}_${TIMESTAMP}.dump"

# Generate a plain SQL backup as well (easier to restore piecemeal)
pg_dump "$DB_URL" \
  --format=plain \
  --compress=9 \
  --file="$OUTPUT_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz" \
  2>&1 | tail -3

echo "[$(date '+%Y-%m-%d %H:%M:%S')] SQL backup complete: $OUTPUT_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Remove backups older than retention period
find "$OUTPUT_DIR" -name "${DB_NAME}_*.dump" -type f -mtime +$RETENTION_DAYS -delete
find "$OUTPUT_DIR" -name "${DB_NAME}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Old backups cleaned (retention: $RETENTION_DAYS days)"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup finished successfully."
