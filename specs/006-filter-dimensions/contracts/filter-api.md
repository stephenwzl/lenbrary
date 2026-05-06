# Filter API Contract

**Feature**: 006-filter-dimensions
**Date**: 2026-05-06

## GET /api/library/assets (扩展)

现有端点扩展查询参数。

### 新增查询参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `captureDateFrom` | `string` | 拍摄日期起始（ISO 日期或 Unix 时间戳） |
| `captureDateTo` | `string` | 拍摄日期截止 |
| `lens` | `string` | 镜头型号精确匹配 |
| `fNumberMin` | `number` | 光圈最小值 |
| `fNumberMax` | `number` | 光圈最大值 |
| `focalLengthMin` | `number` | 焦距最小值 (mm) |
| `focalLengthMax` | `number` | 焦距最大值 (mm) |
| `exposureTimeMin` | `number` | 快门速度最慢值（秒） |
| `exposureTimeMax` | `number` | 快门速度最快值（秒） |
| `isoMin` | `number` | ISO 最小值 |
| `isoMax` | `number` | ISO 最大值 |
| `location` | `string` | 地点名称模糊匹配 |
| `isHdr` | `'true' \| 'false'` | HDR 状态 |
| `videoCodec` | `string` | 视频编码精确匹配 |
| `durationMin` | `number` | 视频最短时长（秒） |
| `durationMax` | `number` | 视频最长时长（秒） |
| `frameRateMin` | `number` | 最低帧率 |
| `frameRateMax` | `number` | 最高帧率 |

### 行为变更

- `camera` 参数：从 LIKE 模糊匹配改为精确匹配（前端使用 facets 提供的完整值）
- `dateFrom`/`dateTo`：保持过滤 `assets.created_at`（导入时间），语义不变

### 示例请求

```
GET /api/library/assets?limit=50&offset=0&captureDateFrom=2025-06-01&captureDateTo=2025-08-31&lens=XF56mmF1.2+R+WR&fNumberMin=1.2&fNumberMax=2.8
```

### 响应格式

不变——与现有 `/api/library/assets` 响应结构一致。

---

## GET /api/library/facets (新增)

返回各筛选维度的可选值列表，供前端自动补全使用。

### 查询参数

无（返回所有维度的可选值）。

### 响应格式

```json
{
  "success": true,
  "data": {
    "cameras": [
      { "make": "Fujifilm", "model": "X-T5", "label": "Fujifilm X-T5" },
      { "make": "Fujifilm", "model": "X-T4", "label": "Fujifilm X-T4" },
      { "make": "Sony", "model": "A7 IV", "label": "Sony A7 IV" }
    ],
    "lenses": [
      "XF56mmF1.2 R WR",
      "XF23mmF1.4 R LM WR",
      "XF16-80mmF4 R OIS WR"
    ],
    "videoCodecs": [
      "h264",
      "h265"
    ],
    "locations": [
      { "city": "Tokyo", "country": "Japan" },
      { "city": "Shanghai", "country": "China" }
    ]
  }
}
```

### 实现约束

- 结果从数据库实际存在的值中提取，不返回空值
- `cameras` 按 make + model 去重并排序
- `lenses` 按 lens_model 去重并排序
- `videoCodecs` 按 video_codec 去重并排序
- `locations` 按 city + country 去重并排序
