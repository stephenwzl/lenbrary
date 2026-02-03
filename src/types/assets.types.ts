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
  file_hash?: string;
  created_at: number;
}

export interface ExifData {
  id?: number;
  asset_id: number;

  // === 基础图像信息 ===
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

  // === 文件信息 ===
  artist?: string;
  copyright?: string;
  image_width?: number;
  image_height?: number;
  x_resolution?: number;
  y_resolution?: number;
  resolution_unit?: string;
  orientation_text?: string;
  compressed_bits_per_pixel?: number;
  thumbnail_offset?: number;
  thumbnail_length?: number;

  // === 拍摄参数 ===
  exposure_program?: string;
  exposure_compensation?: number;
  metering_mode?: string;
  light_source?: string;
  flash?: string;
  subject_distance?: number;
  max_aperture_value?: number;

  // === 相机设置 ===
  white_balance?: string;
  saturation?: number;
  contrast?: string;
  sharpness?: string;
  scene_capture_type?: string;
  custom_rendered?: string;
  sensing_method?: string;

  // === 日期时间 ===
  date_time_original?: string;
  date_time_digitized?: string;
  offset_time?: string;
  offset_time_original?: string;
  offset_time_digitized?: string;

  // === 镜头信息 ===
  lens_info?: string;
  focal_length_in_35mm_film?: number;
  min_focal_length?: number;
  max_focal_length?: number;
  max_aperture_at_min_focal?: number;
  max_aperture_at_max_focal?: number;
  lens_id?: string;
  circle_of_confusion?: string;

  // === 图像生成 ===
  file_source?: string;
  scene_type?: string;

  // === 图像质量和处理 ===
  quality?: string;
  image_generation?: string;
  image_count?: number;
  exposure_count?: number;

  // === Film Mode (胶片模式) ===
  film_mode?: string;
  dynamic_range?: string;
  dynamic_range_setting?: string;
  auto_dynamic_range?: string;
  shadow_tone?: number;
  highlight_tone?: number;

  // === 图像效果 ===
  lens_modulation_optimizer?: string;
  grain_effect?: string;
  color_chrome_effect?: string;
  color_chrome_fx_blue?: string;

  // === 拍摄模式 ===
  shutter_type?: string;
  auto_bracketing?: string;
  sequence_number?: number;
  drive_mode?: string;
  drive_speed?: string;
  crop_mode?: string;

  // === 警告信息 ===
  blur_warning?: string;
  focus_warning?: string;
  exposure_warning?: string;

  // === 闪光灯和脸部检测 ===
  flicker_reduction?: string;
  faces_detected?: number;
  num_face_elements?: number;

  // === 元数据版本 ===
  exif_version?: string;
  flashpix_version?: string;
  components_configuration?: string;
  subject_distance_range?: string;
  scene_capture?: string;

  // === 标识信息 ===
  serial_number?: string;
  internal_serial_number?: string;
  interoperability_index?: string;

  // === 图像稳定 ===
  image_stabilization?: string;

  // === 其他 ===
  user_comment?: string;
  rating?: number;

  // RAW EXIF 数据（用于存储未解析的完整EXIF数据）
  raw_exif?: string;
}

export interface AssetWithExif extends Asset {
  exif?: ExifData;
}

export interface CreateExifData {
  asset_id: number;

  // === 基础图像信息 ===
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

  // === 文件信息 ===
  artist?: string;
  copyright?: string;
  image_width?: number;
  image_height?: number;
  x_resolution?: number;
  y_resolution?: number;
  resolution_unit?: string;
  orientation_text?: string;
  compressed_bits_per_pixel?: number;
  thumbnail_offset?: number;
  thumbnail_length?: number;

  // === 拍摄参数 ===
  exposure_program?: string;
  exposure_compensation?: number;
  metering_mode?: string;
  light_source?: string;
  flash?: string;
  subject_distance?: number;
  max_aperture_value?: number;

  // === 相机设置 ===
  white_balance?: string;
  saturation?: number;
  contrast?: string;
  sharpness?: string;
  scene_capture_type?: string;
  custom_rendered?: string;
  sensing_method?: string;

  // === 日期时间 ===
  date_time_original?: string;
  date_time_digitized?: string;
  offset_time?: string;
  offset_time_original?: string;
  offset_time_digitized?: string;

  // === 镜头信息 ===
  lens_info?: string;
  focal_length_in_35mm_film?: number;
  min_focal_length?: number;
  max_focal_length?: number;
  max_aperture_at_min_focal?: number;
  max_aperture_at_max_focal?: number;
  lens_id?: string;
  circle_of_confusion?: string;

  // === 图像生成 ===
  file_source?: string;
  scene_type?: string;

  // === 图像质量和处理 ===
  quality?: string;
  image_generation?: string;
  image_count?: number;
  exposure_count?: number;

  // === Film Mode (胶片模式) ===
  film_mode?: string;
  dynamic_range?: string;
  dynamic_range_setting?: string;
  auto_dynamic_range?: string;
  shadow_tone?: number;
  highlight_tone?: number;

  // === 图像效果 ===
  lens_modulation_optimizer?: string;
  grain_effect?: string;
  color_chrome_effect?: string;
  color_chrome_fx_blue?: string;

  // === 拍摄模式 ===
  shutter_type?: string;
  auto_bracketing?: string;
  sequence_number?: number;
  drive_mode?: string;
  drive_speed?: string;
  crop_mode?: string;

  // === 警告信息 ===
  blur_warning?: string;
  focus_warning?: string;
  exposure_warning?: string;

  // === 闪光灯和脸部检测 ===
  flicker_reduction?: string;
  faces_detected?: number;
  num_face_elements?: number;

  // === 元数据版本 ===
  exif_version?: string;
  flashpix_version?: string;
  components_configuration?: string;
  subject_distance_range?: string;
  scene_capture?: string;

  // === 标识信息 ===
  serial_number?: string;
  internal_serial_number?: string;
  interoperability_index?: string;

  // === 图像稳定 ===
  image_stabilization?: string;

  // === 其他 ===
  user_comment?: string;
  rating?: number;

  // RAW EXIF 数据（用于存储未解析的完整EXIF数据）
  raw_exif?: string;
}
