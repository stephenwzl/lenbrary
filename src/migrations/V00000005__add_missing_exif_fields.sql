-- Migration: Add Missing EXIF Fields
-- Description: Adds fields that were missing from extended EXIF support

-- // UP

-- === 镜头信息 ===
ALTER TABLE asset_exif ADD COLUMN min_focal_length REAL;
ALTER TABLE asset_exif ADD COLUMN max_focal_length REAL;
ALTER TABLE asset_exif ADD COLUMN max_aperture_at_min_focal REAL;
ALTER TABLE asset_exif ADD COLUMN max_aperture_at_max_focal REAL;
ALTER TABLE asset_exif ADD COLUMN lens_id TEXT;
ALTER TABLE asset_exif ADD COLUMN circle_of_confusion TEXT;

-- === 图像质量和处理 ===
ALTER TABLE asset_exif ADD COLUMN quality TEXT;
ALTER TABLE asset_exif ADD COLUMN image_generation TEXT;
ALTER TABLE asset_exif ADD COLUMN image_count INTEGER;
ALTER TABLE asset_exif ADD COLUMN exposure_count INTEGER;

-- === Film Mode (胶片模式) ===
ALTER TABLE asset_exif ADD COLUMN film_mode TEXT;
ALTER TABLE asset_exif ADD COLUMN dynamic_range TEXT;
ALTER TABLE asset_exif ADD COLUMN dynamic_range_setting TEXT;
ALTER TABLE asset_exif ADD COLUMN auto_dynamic_range TEXT;
ALTER TABLE asset_exif ADD COLUMN shadow_tone INTEGER;
ALTER TABLE asset_exif ADD COLUMN highlight_tone INTEGER;

-- === 图像效果 ===
ALTER TABLE asset_exif ADD COLUMN lens_modulation_optimizer TEXT;
ALTER TABLE asset_exif ADD COLUMN grain_effect TEXT;
ALTER TABLE asset_exif ADD COLUMN color_chrome_effect TEXT;
ALTER TABLE asset_exif ADD COLUMN color_chrome_fx_blue TEXT;

-- === 拍摄模式 ===
ALTER TABLE asset_exif ADD COLUMN shutter_type TEXT;
ALTER TABLE asset_exif ADD COLUMN auto_bracketing TEXT;
ALTER TABLE asset_exif ADD COLUMN sequence_number INTEGER;
ALTER TABLE asset_exif ADD COLUMN drive_mode TEXT;
ALTER TABLE asset_exif ADD COLUMN drive_speed TEXT;
ALTER TABLE asset_exif ADD COLUMN crop_mode TEXT;

-- === 警告信息 ===
ALTER TABLE asset_exif ADD COLUMN blur_warning TEXT;
ALTER TABLE asset_exif ADD COLUMN focus_warning TEXT;
ALTER TABLE asset_exif ADD COLUMN exposure_warning TEXT;

-- === 闪光灯和脸部检测 ===
ALTER TABLE asset_exif ADD COLUMN flicker_reduction TEXT;
ALTER TABLE asset_exif ADD COLUMN faces_detected INTEGER;
ALTER TABLE asset_exif ADD COLUMN num_face_elements INTEGER;

-- === 元数据版本 ===
ALTER TABLE asset_exif ADD COLUMN exif_version TEXT;
ALTER TABLE asset_exif ADD COLUMN flashpix_version TEXT;
ALTER TABLE asset_exif ADD COLUMN components_configuration TEXT;
ALTER TABLE asset_exif ADD COLUMN subject_distance_range TEXT;
ALTER TABLE asset_exif ADD COLUMN scene_capture TEXT;

-- === 标识信息 ===
ALTER TABLE asset_exif ADD COLUMN serial_number TEXT;
ALTER TABLE asset_exif ADD COLUMN internal_serial_number TEXT;
ALTER TABLE asset_exif ADD COLUMN interoperability_index TEXT;

-- === 图像稳定 ===
ALTER TABLE asset_exif ADD COLUMN image_stabilization TEXT;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_exif_film_mode ON asset_exif(film_mode);
CREATE INDEX IF NOT EXISTS idx_exif_serial_number ON asset_exif(serial_number);

-- // DOWN

DROP INDEX IF EXISTS idx_exif_serial_number;
DROP INDEX IF EXISTS idx_exif_film_mode;

ALTER TABLE asset_exif DROP COLUMN image_stabilization;
ALTER TABLE asset_exif DROP COLUMN internal_serial_number;
ALTER TABLE asset_exif DROP COLUMN serial_number;
ALTER TABLE asset_exif DROP COLUMN interoperability_index;
ALTER TABLE asset_exif DROP COLUMN scene_capture;
ALTER TABLE asset_exif DROP COLUMN subject_distance_range;
ALTER TABLE asset_exif DROP COLUMN components_configuration;
ALTER TABLE asset_exif DROP COLUMN flashpix_version;
ALTER TABLE asset_exif DROP COLUMN exif_version;
ALTER TABLE asset_exif DROP COLUMN num_face_elements;
ALTER TABLE asset_exif DROP COLUMN faces_detected;
ALTER TABLE asset_exif DROP COLUMN flicker_reduction;
ALTER TABLE asset_exif DROP COLUMN exposure_warning;
ALTER TABLE asset_exif DROP COLUMN focus_warning;
ALTER TABLE asset_exif DROP COLUMN blur_warning;
ALTER TABLE asset_exif DROP COLUMN crop_mode;
ALTER TABLE asset_exif DROP COLUMN drive_speed;
ALTER TABLE asset_exif DROP COLUMN drive_mode;
ALTER TABLE asset_exif DROP COLUMN sequence_number;
ALTER TABLE asset_exif DROP COLUMN auto_bracketing;
ALTER TABLE asset_exif DROP COLUMN shutter_type;
ALTER TABLE asset_exif DROP COLUMN color_chrome_fx_blue;
ALTER TABLE asset_exif DROP COLUMN color_chrome_effect;
ALTER TABLE asset_exif DROP COLUMN grain_effect;
ALTER TABLE asset_exif DROP COLUMN lens_modulation_optimizer;
ALTER TABLE asset_exif DROP COLUMN highlight_tone;
ALTER TABLE asset_exif DROP COLUMN shadow_tone;
ALTER TABLE asset_exif DROP COLUMN auto_dynamic_range;
ALTER TABLE asset_exif DROP COLUMN dynamic_range_setting;
ALTER TABLE asset_exif DROP COLUMN dynamic_range;
ALTER TABLE asset_exif DROP COLUMN film_mode;
ALTER TABLE asset_exif DROP COLUMN exposure_count;
ALTER TABLE asset_exif DROP COLUMN image_count;
ALTER TABLE asset_exif DROP COLUMN image_generation;
ALTER TABLE asset_exif DROP COLUMN quality;
ALTER TABLE asset_exif DROP COLUMN circle_of_confusion;
ALTER TABLE asset_exif DROP COLUMN lens_id;
ALTER TABLE asset_exif DROP COLUMN max_aperture_at_max_focal;
ALTER TABLE asset_exif DROP COLUMN max_aperture_at_min_focal;
ALTER TABLE asset_exif DROP COLUMN max_focal_length;
ALTER TABLE asset_exif DROP COLUMN min_focal_length;
