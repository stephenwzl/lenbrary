-- Migration: Add additional indexes
-- Description: Adds composite indexes for better query performance

-- // UP

CREATE INDEX IF NOT EXISTS idx_assets_composite_type_date ON assets(file_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_size ON assets(file_size);
CREATE INDEX IF NOT EXISTS idx_exif_asset_id ON asset_exif(asset_id);
CREATE INDEX IF NOT EXISTS idx_exif_gps ON asset_exif(gps_latitude, gps_longitude);

-- // DOWN

DROP INDEX IF EXISTS idx_exif_gps;
DROP INDEX IF EXISTS idx_exif_asset_id;
DROP INDEX IF EXISTS idx_assets_size;
DROP INDEX IF EXISTS idx_assets_composite_type_date;
