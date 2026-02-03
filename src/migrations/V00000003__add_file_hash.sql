-- Migration: Add file_hash field for deduplication
-- Description: Adds file_hash field with unique index to prevent duplicate uploads

-- // UP

-- Add file_hash column to assets table
ALTER TABLE assets ADD COLUMN file_hash TEXT;

-- Create unique index on file_hash for fast duplicate detection
CREATE UNIQUE INDEX IF NOT EXISTS idx_assets_file_hash ON assets(file_hash);

-- // DOWN

-- Remove the unique index
DROP INDEX IF EXISTS idx_assets_file_hash;

-- Remove the file_hash column
-- Note: SQLite doesn't support DROP COLUMN directly in older versions
-- but Modern SQLite (3.35.0+) does support it
ALTER TABLE assets DROP COLUMN IF EXISTS file_hash;
