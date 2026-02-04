-- Migration: Add Video Metadata
-- Description: Adds table for video file metadata extraction

-- // UP

-- 创建视频元数据表
CREATE TABLE IF NOT EXISTS asset_video_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL UNIQUE,
  duration REAL,
  video_codec TEXT,
  video_bitrate INTEGER,
  audio_codec TEXT,
  audio_bitrate INTEGER,
  audio_sample_rate INTEGER,
  audio_channels INTEGER,
  frame_rate REAL,
  pixel_format TEXT,
  color_space TEXT,
  color_primaries TEXT,
  color_transfer TEXT,
  color_range TEXT,
  is_hdr INTEGER,
  hdr_format TEXT,
  bit_depth INTEGER,
  streams_video INTEGER,
  streams_audio INTEGER,
  streams_subtitle INTEGER,
  total_bitrate INTEGER,
  raw_metadata TEXT,
  FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_video_metadata_asset_id ON asset_video_metadata(asset_id);
CREATE INDEX IF NOT EXISTS idx_video_metadata_is_hdr ON asset_video_metadata(is_hdr);
CREATE INDEX IF NOT EXISTS idx_video_metadata_hdr_format ON asset_video_metadata(hdr_format);
CREATE INDEX IF NOT EXISTS idx_video_metadata_video_codec ON asset_video_metadata(video_codec);

-- // DOWN

DROP INDEX IF EXISTS idx_video_metadata_video_codec;
DROP INDEX IF EXISTS idx_video_metadata_hdr_format;
DROP INDEX IF EXISTS idx_video_metadata_is_hdr;
DROP INDEX IF EXISTS idx_video_metadata_asset_id;
DROP TABLE IF EXISTS asset_video_metadata;
