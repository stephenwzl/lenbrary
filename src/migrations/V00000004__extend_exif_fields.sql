-- Migration: Extend EXIF Fields
-- Description: Extends asset_exif table with additional EXIF fields for comprehensive metadata support

-- // UP

-- File Information
ALTER TABLE asset_exif ADD COLUMN artist TEXT;
ALTER TABLE asset_exif ADD COLUMN copyright TEXT;
ALTER TABLE asset_exif ADD COLUMN image_width INTEGER;
ALTER TABLE asset_exif ADD COLUMN image_height INTEGER;
ALTER TABLE asset_exif ADD COLUMN x_resolution REAL;
ALTER TABLE asset_exif ADD COLUMN y_resolution REAL;
ALTER TABLE asset_exif ADD COLUMN resolution_unit TEXT;
ALTER TABLE asset_exif ADD COLUMN orientation_text TEXT;
ALTER TABLE asset_exif ADD COLUMN compressed_bits_per_pixel REAL;
ALTER TABLE asset_exif ADD COLUMN thumbnail_offset INTEGER;
ALTER TABLE asset_exif ADD COLUMN thumbnail_length INTEGER;

-- Shooting Parameters
ALTER TABLE asset_exif ADD COLUMN exposure_program TEXT;
ALTER TABLE asset_exif ADD COLUMN exposure_compensation REAL;
ALTER TABLE asset_exif ADD COLUMN metering_mode TEXT;
ALTER TABLE asset_exif ADD COLUMN light_source TEXT;
ALTER TABLE asset_exif ADD COLUMN flash TEXT;
ALTER TABLE asset_exif ADD COLUMN subject_distance REAL;
ALTER TABLE asset_exif ADD COLUMN max_aperture_value REAL;

-- Camera Settings
ALTER TABLE asset_exif ADD COLUMN white_balance TEXT;
ALTER TABLE asset_exif ADD COLUMN saturation INTEGER;
ALTER TABLE asset_exif ADD COLUMN contrast TEXT;
ALTER TABLE asset_exif ADD COLUMN sharpness TEXT;
ALTER TABLE asset_exif ADD COLUMN scene_capture_type TEXT;
ALTER TABLE asset_exif ADD COLUMN custom_rendered TEXT;
ALTER TABLE asset_exif ADD COLUMN sensing_method TEXT;

-- Date/Time Fields
ALTER TABLE asset_exif ADD COLUMN date_time_original TEXT;
ALTER TABLE asset_exif ADD COLUMN date_time_digitized TEXT;
ALTER TABLE asset_exif ADD COLUMN offset_time TEXT;
ALTER TABLE asset_exif ADD COLUMN offset_time_original TEXT;
ALTER TABLE asset_exif ADD COLUMN offset_time_digitized TEXT;

-- Lens Information
ALTER TABLE asset_exif ADD COLUMN lens_info TEXT;
ALTER TABLE asset_exif ADD COLUMN focal_length_in_35mm_film INTEGER;

-- Image Generation
ALTER TABLE asset_exif ADD COLUMN file_source TEXT;
ALTER TABLE asset_exif ADD COLUMN scene_type TEXT;

-- Other
ALTER TABLE asset_exif ADD COLUMN user_comment TEXT;
ALTER TABLE asset_exif ADD COLUMN rating INTEGER;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_exif_date_time_original ON asset_exif(date_time_original);
CREATE INDEX IF NOT EXISTS idx_exif_rating ON asset_exif(rating);
CREATE INDEX IF NOT EXISTS idx_exif_lens_model ON asset_exif(lens_model);

-- // DOWN

DROP INDEX IF EXISTS idx_exif_lens_model;
DROP INDEX IF EXISTS idx_exif_rating;
DROP INDEX IF EXISTS idx_exif_date_time_original;

ALTER TABLE asset_exif DROP COLUMN rating;
ALTER TABLE asset_exif DROP COLUMN user_comment;
ALTER TABLE asset_exif DROP COLUMN scene_type;
ALTER TABLE asset_exif DROP COLUMN file_source;
ALTER TABLE asset_exif DROP COLUMN focal_length_in_35mm_film;
ALTER TABLE asset_exif DROP COLUMN lens_info;
ALTER TABLE asset_exif DROP COLUMN offset_time_digitized;
ALTER TABLE asset_exif DROP COLUMN offset_time_original;
ALTER TABLE asset_exif DROP COLUMN offset_time;
ALTER TABLE asset_exif DROP COLUMN date_time_digitized;
ALTER TABLE asset_exif DROP COLUMN date_time_original;
ALTER TABLE asset_exif DROP COLUMN sensing_method;
ALTER TABLE asset_exif DROP COLUMN custom_rendered;
ALTER TABLE asset_exif DROP COLUMN scene_capture_type;
ALTER TABLE asset_exif DROP COLUMN sharpness;
ALTER TABLE asset_exif DROP COLUMN contrast;
ALTER TABLE asset_exif DROP COLUMN saturation;
ALTER TABLE asset_exif DROP COLUMN white_balance;
ALTER TABLE asset_exif DROP COLUMN max_aperture_value;
ALTER TABLE asset_exif DROP COLUMN subject_distance;
ALTER TABLE asset_exif DROP COLUMN flash;
ALTER TABLE asset_exif DROP COLUMN light_source;
ALTER TABLE asset_exif DROP COLUMN metering_mode;
ALTER TABLE asset_exif DROP COLUMN exposure_compensation;
ALTER TABLE asset_exif DROP COLUMN exposure_program;
ALTER TABLE asset_exif DROP COLUMN thumbnail_length;
ALTER TABLE asset_exif DROP COLUMN thumbnail_offset;
ALTER TABLE asset_exif DROP COLUMN compressed_bits_per_pixel;
ALTER TABLE asset_exif DROP COLUMN orientation_text;
ALTER TABLE asset_exif DROP COLUMN resolution_unit;
ALTER TABLE asset_exif DROP COLUMN y_resolution;
ALTER TABLE asset_exif DROP COLUMN x_resolution;
ALTER TABLE asset_exif DROP COLUMN image_height;
ALTER TABLE asset_exif DROP COLUMN image_width;
ALTER TABLE asset_exif DROP COLUMN copyright;
ALTER TABLE asset_exif DROP COLUMN artist;
