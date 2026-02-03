CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  mime_type TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(file_type);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);

CREATE TABLE IF NOT EXISTS asset_exif (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL UNIQUE,
  make TEXT,
  model TEXT,
  datetime TEXT,
  exposure_time TEXT,
  f_number REAL,
  iso INTEGER,
  focal_length REAL,
  lens_make TEXT,
  lens_model TEXT,
  orientation INTEGER,
  gps_latitude REAL,
  gps_longitude REAL,
  software TEXT,
  color_space TEXT,
  raw_exif TEXT,
  FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_exif_datetime ON asset_exif(datetime);
CREATE INDEX IF NOT EXISTS idx_exif_make_model ON asset_exif(make, model);
