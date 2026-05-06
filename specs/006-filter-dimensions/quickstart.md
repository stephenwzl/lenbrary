# Quickstart: 筛选器维度优化

**Feature**: 006-filter-dimensions
**Date**: 2026-05-06

## 前置条件

- Feature 005 (UI Framework Adoption) 已完成并合并到 main
- 数据库中已有资产和 EXIF 数据

## 实施顺序

### Phase 1: 后端扩展（数据库 + API）

1. **新增数据库迁移** `V00000010__add_filter_dimension_indexes.sql`
   - 为新增筛选字段创建索引（`f_number`、`focal_length`、`exposure_time`、`iso`、`gps_latitude`/`gps_longitude`）
   - 创建 `asset_locations` 表

2. **扩展 LibraryFilters 类型** `src/types/library.types.ts`
   - 新增 18 个可选字段（captureDateFrom/To、lens、fNumberMin/Max、focalLengthMin/Max、exposureTimeMin/Max、isoMin/Max、location、isHdr、videoCodec、durationMin/Max、frameRateMin/Max）

3. **扩展 parseFilters** `src/services/library.service.ts`
   - 解析新增查询参数
   - 数值范围参数转为 number 类型
   - `camera` 改为精确匹配模式（保持 LIKE 向后兼容作为 fallback）

4. **扩展 SQL 查询** `src/services/database.service.ts`
   - 按需 JOIN 表（asset_exif, asset_video_metadata, asset_locations）
   - 新增 WHERE 子句处理所有新筛选维度
   - 条件性使用 DISTINCT

5. **新增 facets 端点** `src/routes/library.routes.ts`
   - `GET /api/library/facets` 返回各维度可选值
   - 在 database.service.ts 中新增查询方法

### Phase 2: 前端扩展（类型 + API + 组件）

6. **扩展 FilterState** `src/ui/react/types.ts`
   - 新增对应后端的 18 个字段

7. **扩展 api.ts** `src/ui/react/api.ts`
   - `createLibraryQuery` 已自动处理新字段（遍历 entries）
   - 新增 `fetchFacets()` 函数

8. **扩展 useFilters** `src/ui/react/hooks/use-filters.ts`
   - 更新 `emptyFilters` 常量
   - 新增 facets 状态管理
   - 相机筛选器改用 facets 数据

9. **重构 FilterBar** `src/ui/react/components/features/filter-bar.tsx`
   - 日期筛选区：拆分为"拍摄日期"和"导入日期"两组
   - 拍摄参数区：镜头（自动补全 Select）、光圈（范围 Input）、焦距（范围 Input）、快门速度（范围 Input）、ISO（范围 Input）
   - 地理位置区：地点名称自动补全
   - 视频属性区：HDR（Select）、编码格式（自动补全）、时长（范围 Input）、帧率（范围 Input）——条件展示
   - 相机筛选器升级为自动补全 Select

### Phase 3: 地理位置预计算

10. **反向地理编码**（在资产导入/元数据提取时触发）
    - 检测 GPS 坐标 → 调用离线反向地理编码 → 写入 `asset_locations` 表
    - 需在元数据处理流程中集成

### Phase 4: 测试

11. **后端单元测试**：parseFilters 新参数解析、SQL 查询构建
12. **集成测试**：端到端筛选验证
13. **API 契约测试**：facets 端点响应格式

## 关键风险

- **SQLite 性能**：多维度 + 多表 JOIN 在数万资产时可能较慢，需关注查询计划
- **反向地理编码数据**：`local-reverse-geocoder` 的 GeoNames 数据包约 30MB，需考虑下载时机
- **date_time_original 格式**：EXIF 日期格式为 "2025:07:15 14:30:00"（冒号分隔），需在 SQL 比较时处理格式转换

## 验证方法

1. 设置拍摄日期范围 → 验证结果中所有资产的 EXIF 拍摄日期在范围内
2. 选择特定镜头 → 验证结果中所有资产的 lens_model 匹配
3. 设置光圈范围 → 验证 f_number 在范围内
4. 输入地点名称 → 验证 GPS 坐标位于该地点附近
5. 勾选 HDR → 验证仅展示 is_hdr=1 的视频
6. 设置 type=image → 验证视频专属筛选器不可见
