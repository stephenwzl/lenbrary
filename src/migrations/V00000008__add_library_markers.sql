-- Migration: Add Library Organization Markers
-- Description: Adds favorite and tag state for the personal library MVP

-- // UP

CREATE TABLE IF NOT EXISTS asset_favorites (
  asset_id INTEGER PRIMARY KEY,
  favorite INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS asset_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  tag TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  UNIQUE(asset_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_asset_favorites_favorite ON asset_favorites(favorite);
CREATE INDEX IF NOT EXISTS idx_asset_tags_tag ON asset_tags(tag);
CREATE INDEX IF NOT EXISTS idx_asset_tags_asset_id ON asset_tags(asset_id);

-- // DOWN

DROP INDEX IF EXISTS idx_asset_tags_asset_id;
DROP INDEX IF EXISTS idx_asset_tags_tag;
DROP INDEX IF EXISTS idx_asset_favorites_favorite;
DROP TABLE IF EXISTS asset_tags;
DROP TABLE IF EXISTS asset_favorites;
