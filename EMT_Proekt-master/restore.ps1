# restore.ps1 - Clean version without emoji characters
param(
    [Parameter(Mandatory=$true)]
    [string]$Timestamp
)

$BACKUP_DIR = "backups"

# Check if backup files exist
$dbBackupFile = "$BACKUP_DIR/db_backup_$Timestamp.sql"
$filesBackupFile = "$BACKUP_DIR/files_backup_$Timestamp.tar.gz"

if (-not (Test-Path $dbBackupFile)) {
    Write-Host "Database backup file not found: $dbBackupFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $filesBackupFile)) {
    Write-Host "Files backup file not found: $filesBackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "Restoring from backup $Timestamp..." -ForegroundColor Yellow

# Stop services
Write-Host "Stopping services..." -ForegroundColor Gray
docker-compose down

# Restore database
Write-Host "Starting database service..." -ForegroundColor Gray
docker-compose up -d postgres
Start-Sleep -Seconds 10

Write-Host "Restoring database..." -ForegroundColor Gray
Get-Content $dbBackupFile | docker-compose exec -T postgres psql -U assignments_user -d assignments_db

# Restore files
Write-Host "Restoring files..." -ForegroundColor Gray
$currentDir = (Get-Location).Path
docker run --rm -v assignments_backend_uploads:/data -v "$currentDir/$BACKUP_DIR":/backup alpine tar xzf "/backup/files_backup_$Timestamp.tar.gz" -C /data

# Start all services
Write-Host "Starting all services..." -ForegroundColor Gray
docker-compose up -d

Write-Host "Restore completed successfully!" -ForegroundColor Green