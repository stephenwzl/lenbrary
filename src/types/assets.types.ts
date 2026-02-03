export interface Asset {
  id?: number;
  original_name: string;
  stored_name: string;
  file_path: string;
  thumbnail_path?: string;
  mime_type: string;
  file_type: 'image' | 'video';
  file_size: number;
  width?: number;
  height?: number;
  created_at: number;
}

export interface ExifData {
  id?: number;
  asset_id: number;
  make?: string;
  model?: string;
  datetime?: string;
  exposure_time?: string;
  f_number?: number;
  iso?: number;
  focal_length?: number;
  lens_make?: string;
  lens_model?: string;
  orientation?: number;
  gps_latitude?: number;
  gps_longitude?: number;
  software?: string;
  color_space?: string;
  raw_exif?: string;
}

export interface AssetWithExif extends Asset {
  exif?: ExifData;
}

export interface CreateExifData {
  asset_id: number;
  make?: string;
  model?: string;
  datetime?: string;
  exposure_time?: string;
  f_number?: number;
  iso?: number;
  focal_length?: number;
  lens_make?: string;
  lens_model?: string;
  orientation?: number;
  gps_latitude?: number;
  gps_longitude?: number;
  software?: string;
  color_space?: string;
  raw_exif?: string;
}
