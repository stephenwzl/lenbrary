-- Migration: Add Missing EXIF Fields Part 2
-- Description: Adds fields that were missed in previous migrations

-- // UP

-- 标识信息
ALTER TABLE asset_exif ADD COLUMN body_serial_number TEXT;

-- 识别相关
ALTER TABLE asset_exif ADD COLUMN face_index INTEGER;
ALTER TABLE asset_exif ADD COLUMN face_detected INTEGER;
ALTER TABLE asset_exif ADD COLUMN recognized_face_count INTEGER;

-- 拍摄模式
ALTER TABLE asset_exif ADD COLUMN exposure_mode TEXT;

-- // DOWN

ALTER TABLE asset_exif DROP COLUMN exposure_mode;
ALTER TABLE asset_exif DROP COLUMN recognized_face_count;
ALTER TABLE asset_exif DROP COLUMN face_detected;
ALTER TABLE asset_exif DROP COLUMN face_index;
ALTER TABLE asset_exif DROP COLUMN body_serial_number;
