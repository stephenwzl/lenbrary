# Data Model: 筛选器维度优化

**Feature**: 006-filter-dimensions
**Date**: 2026-05-06

## Entity Changes

### 1. LibraryFilters (扩展)

现有接口扩展，新增筛选维度字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `captureDateFrom` | `number?` | 拍摄日期起始（Unix 时间戳），基于 `asset_exif.date_time_original` |
| `captureDateTo` | `number?` | 拍摄日期截止（Unix 时间戳） |
| `lens` | `string?` | 镜头型号，精确匹配 `asset_exif.lens_model` |
| `fNumberMin` | `number?` | 光圈最小值 |
| `fNumberMax` | `number?` | 光圈最大值 |
| `focalLengthMin` | `number?` | 焦距最小值 (mm) |
| `focalLengthMax` | `number?` | 焦距最大值 (mm) |
| `exposureTimeMin` | `number?` | 快门速度最慢值（秒，值越大越慢） |
| `exposureTimeMax` | `number?` | 快门速度最快值（秒） |
| `isoMin` | `number?` | ISO 最小值 |
| `isoMax` | `number?` | ISO 最大值 |
| `location` | `string?` | 地点名称，LIKE 匹配 `asset_locations.city`/`country` |
| `isHdr` | `boolean?` | HDR 状态，匹配 `asset_video_metadata.is_hdr` |
| `videoCodec` | `string?` | 视频编码，匹配 `asset_video_metadata.video_codec` |
| `durationMin` | `number?` | 视频最短时长（秒） |
| `durationMax` | `number?` | 视频最长时长（秒） |
| `frameRateMin` | `number?` | 最低帧率 |
| `frameRateMax` | `number?` | 最高帧率 |

**语义变更**: `camera` 字段从 LIKE 模糊匹配改为精确匹配 `asset_exif.make + ' ' + asset_exif.model`（前端 facets 提供完整可选值）。

### 2. FilterState (前端扩展)

前端 FilterState 对应扩展，所有值保持 `string` 类型（与现有模式一致）：

| 字段 | 类型 | 说明 |
|------|------|------|
| `captureDateFrom` | `string` | 拍摄日期起始（ISO 日期字符串） |
| `captureDateTo` | `string` | 拍摄日期截止 |
| `lens` | `string` | 镜头型号 |
| `fNumberMin` | `string` | 光圈最小值 |
| `fNumberMax` | `string` | 光圈最大值 |
| `focalLengthMin` | `string` | 焦距最小值 |
| `focalLengthMax` | `string` | 焦距最大值 |
| `exposureTimeMin` | `string` | 快门速度最慢值 |
| `exposureTimeMax` | `string` | 快门速度最快值 |
| `isoMin` | `string` | ISO 最小值 |
| `isoMax` | `string` | ISO 最大值 |
| `location` | `string` | 地点名称 |
| `isHdr` | `'' \| 'true' \| 'false'` | HDR 状态 |
| `videoCodec` | `string` | 视频编码 |
| `durationMin` | `string` | 视频最短时长 |
| `durationMax` | `string` | 视频最长时长 |
| `frameRateMin` | `string` | 最低帧率 |
| `frameRateMax` | `string` | 最高帧率 |

### 3. asset_locations (新增表)

存储从 GPS 坐标预计算的地点信息：

| 字段 | 类型 | 说明 |
|------|------|------|
| `asset_id` | `INTEGER PK FK` | 关联 assets.id，CASCADE 删除 |
| `latitude` | `REAL` | GPS 纬度 |
| `longitude` | `REAL` | GPS 经度 |
| `city` | `TEXT` | 城市名（如 "Tokyo"） |
| `country` | `TEXT` | 国家名（如 "Japan"） |
| `admin_area` | `TEXT` | 行政区（如 "Tokyo Prefecture"） |
| `updated_at` | `INTEGER` | 最后更新时间戳 |

索引:
- `idx_locations_city ON asset_locations(city)`
- `idx_locations_country ON asset_locations(country)`
- `idx_locations_city_country ON asset_locations(city, country)`

### 4. FacetsResponse (新增)

facets API 端点返回的可选值集合：

| 字段 | 类型 | 说明 |
|------|------|------|
| `cameras` | `CameraOption[]` | 相机列表 (make + model) |
| `lenses` | `string[]` | 镜头型号列表 |
| `videoCodecs` | `string[]` | 视频编码列表 |
| `locations` | `LocationOption[]` | 地点列表 (city + country) |

其中:
- `CameraOption = { make: string, model: string, label: string }`（label = "Fujifilm X-T5"）
- `LocationOption = { city: string, country: string }`

## Relationships

```text
assets (1) ←→ (0..1) asset_exif         [已有，ON DELETE CASCADE]
assets (1) ←→ (0..1) asset_video_metadata [已有，ON DELETE CASCADE]
assets (1) ←→ (0..1) asset_locations     [新增，ON DELETE CASCADE]
assets (1) ←→ (0..*) asset_tags          [已有，ON DELETE CASCADE]
assets (1) ←→ (0..1) asset_favorites     [已有，ON DELETE CASCADE]
```

## Validation Rules

- 数值范围筛选：`Min` 必须 ≤ `Max`，否则忽略 `Max`
- 拍摄日期：`captureDateFrom` ≤ `captureDateTo`
- 视频专属筛选器：`isHdr`、`videoCodec`、`durationMin/Max`、`frameRateMin/Max` 仅在 `type=video` 或 `type=''` 时有效
- GPS 缺失处理：`asset_exif.gps_latitude`/`gps_longitude` 为 NULL 时不生成 `asset_locations` 记录
