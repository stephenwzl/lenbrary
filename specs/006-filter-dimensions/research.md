# Research: 筛选器维度优化

**Feature**: 006-filter-dimensions
**Date**: 2026-05-06

## R1: 日期筛选语义——拍摄日期 vs 导入日期

**Decision**: 将当前 `dateFrom`/`dateTo` 保持为导入日期（`assets.created_at`），新增 `captureDateFrom`/`captureDateTo` 用于拍摄日期（`asset_exif.date_time_original`）。

**Rationale**:
- 现有 API 消费者（前端、集成测试）已依赖 `dateFrom`/`dateTo` 作为导入日期的语义，直接改语义会破坏向后兼容
- `date_time_original` 是 EXIF TEXT 类型（如 "2025:07:15 14:30:00"），需用字符串比较或转换为 Unix 时间戳
- 数据库已有索引 `idx_exif_date_time_original`，性能有保障
- 无拍摄日期的资产在拍摄日期筛选中默认排除，UI 提供提示

**Alternatives considered**:
- **改 dateFrom/dateTo 语义为拍摄日期**：破坏向后兼容，且导入日期筛选仍有价值（如"最近导入的"）
- **统一日期维度 + 下拉切换"拍摄/导入"**：增加 UI 复杂度，两个独立维度更直观

## R2: 数值范围筛选的 SQL 策略

**Decision**: 使用 `BETWEEN ? AND ?` SQL 子句，前端传入 min/max 两个参数。对于单端限定（仅设 min 或 max），使用 `>= ?` 或 `<= ?`。

**Rationale**:
- SQLite 对 `BETWEEN` 有索引优化
- `f_number`、`focal_length`、`exposure_time`、`iso` 均为 REAL/INTEGER 类型，可直接数值比较
- 前端 FilterState 使用 `string` 类型存储值（与现有模式一致），后端 parseFilters 负责类型转换

**Alternatives considered**:
- **前端传入完整范围字符串**（如 "1.2-2.8"）：解析复杂，易出错
- **使用 HAVING 子句**：不适用于 WHERE 过滤场景

## R3: 镜头和相机的可选值列表

**Decision**: 新增 `/api/library/facets` API 端点，返回各维度的可选值列表（相机 make+model、镜头 lens_model、视频编码 video_codec 等）。前端缓存 facets 结果供自动补全使用。

**Rationale**:
- 相机筛选器当前是自由文本输入 + LIKE 模糊匹配，用户体验差且不准确
- 数据库已有 `idx_exif_make_model` 和 `idx_exif_lens_model` 索引，查询效率高
- Facets API 一次返回所有维度的可选值，减少请求次数
- 前端可在 FilterBar 挂载时预加载 facets，缓存直到资产变更

**Alternatives considered**:
- **为每个维度单独建 API**：请求次数多，管理复杂
- **在 listAssets 响应中附加 facets**：增加列表响应体积，分页场景下不合适

## R4: 地理位置筛选策略

**Decision**: 第一版采用简单的地点文本搜索——从 EXIF GPS 坐标反向地理编码为城市名，存储在新增的 `asset_locations` 表中，筛选时按城市名精确匹配或 LIKE 模糊匹配。

**Rationale**:
- 纯 GPS 范围筛选（经纬度矩形）对用户不友好，用户想搜"Tokyo"而非"35.6762°N, 139.6503°E"
- 离线反向地理编码可用 `local-reverse-geocoder` npm 包（基于 GeoNames 数据）
- 预计算地点名避免每次查询时做反向编码
- 第一版仅支持城市级别，后续可扩展到国家/区域

**Alternatives considered**:
- **实时调用外部 Geocoding API**：违反离线优先约束
- **R-tree 空间索引**：SQLite 不原生支持 R-tree（需扩展），过度设计
- **仅支持经纬度范围输入**：UX 差，摄影爱好者以地名思考

## R5: 视频专属筛选器的条件展示

**Decision**: 前端根据 `type` 筛选值决定是否展示视频专属筛选器。当 `type=video` 或 `type=''`（全部）时展示，`type=image` 时隐藏。

**Rationale**:
- 避免照片视图中出现不相关的 HDR、编码等选项
- 减少用户认知负担
- 简单的条件渲染即可实现，无需额外后端逻辑

**Alternatives considered**:
- **始终展示所有筛选器**：UI 混乱，照片用户不需要看视频选项
- **后端根据 type 过滤可选值**：增加 facets API 复杂度，前端条件渲染更简单

## R6: SQL JOIN 优化

**Decision**: 改为按需 JOIN——仅在对应筛选条件被激活时才 JOIN 相关表。无筛选条件时仅查询 `assets` 表。

**Rationale**:
- 当前实现始终 LEFT JOIN 4 张表 + DISTINCT，即使不需要关联数据
- 随着筛选维度增加，JOIN 表可能达到 5-6 张，无过滤时性能浪费严重
- 按需 JOIN + 条件性 DISTINCT 可显著减少查询开销
- 需要跟踪哪些表已被 JOIN，避免重复 JOIN

**Alternatives considered**:
- **维持始终 JOIN**：简单但随着维度增长性能持续劣化
- **使用子查询代替 JOIN**：对某些筛选条件（如 tag）可能更高效，但代码复杂度增加

## R7: 快门速度展示格式

**Decision**: 后端存储和比较使用 `exposure_time` 的浮点数值（秒），前端 UI 展示时将常见值转换为分数格式（如 0.033333 → "1/30"），用户输入也支持分数格式（如 "1/30" → 0.033333）。

**Rationale**:
- 摄影爱好者习惯以分数思考快门速度（1/60, 1/125, 1/500 等）
- 浮点数存储便于范围比较，避免字符串排序问题
- 分数格式转换是纯前端展示逻辑

**Alternatives considered**:
- **仅使用小数展示**：对摄影爱好者不直观
- **存储为分数**：增加 SQL 比较复杂度
