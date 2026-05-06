-- Migration: Add Import Events
-- Description: Tracks user-visible import outcomes for library status

-- // UP

CREATE TABLE IF NOT EXISTS import_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  input_name TEXT NOT NULL,
  status TEXT NOT NULL,
  asset_id INTEGER,
  message TEXT NOT NULL,
  media_type TEXT,
  metadata_available INTEGER NOT NULL DEFAULT 0,
  thumbnail_available INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_import_events_status ON import_events(status);
CREATE INDEX IF NOT EXISTS idx_import_events_asset_id ON import_events(asset_id);

-- // DOWN

DROP INDEX IF EXISTS idx_import_events_asset_id;
DROP INDEX IF EXISTS idx_import_events_status;
DROP TABLE IF EXISTS import_events;
