# Xtream VOD 详情展示流程优化任务规划

## 任务概述

优化 Xtream Code VOD（视频点播）的详情展示流程，主要包括三个方面：
1. 参考 Flutter 实现，添加 VOD 视频详情 API 调用
2. 优化数据存储，新建数据库表保存视频详情
3. 参考 Flutter 详情页布局，优化 Vue 组件的展示效果

## 参考文件分析

### Flutter 实现分析

#### API 调用方式 (`xtream_api_client.dart`)
- 实现了 `getVodInfo(int vodId)` 方法
- 调用 Xtream API: `{base}/player_api.php?username={}&password={}&action=get_vod_info&vod_id={}`
- 返回 `Map<String, dynamic>` 包含详细的视频信息

#### 数据仓库实现 (`xtream_repository_impl.dart`)
- `getVodInfo(int sourceId, int vodId)` 方法
- 从数据库获取源凭据，初始化 API 客户端
- 调用 API 并返回 `XtreamVodInfoDO` 对象

#### 详情页布局 (`stream_detail_page.dart`)
- 使用 `CustomScrollView` + `SliverAppBar` 实现滚动效果
- 包含：
  - 背景图片 (backdrop/poster)
  - 播放按钮
  - 详细信息展示 (评分、类型、发布日期、时长、导演、演员、剧情简介)
  - 渐变遮罩和阴影效果

### Chrome 扩展当前实现

#### API 服务 (`xtreamApiService.ts`)
- 缺少 `get_vod_info` API 调用方法
- 只有基本的分类和流获取功能

#### 详情页组件 (`XtreamVodDetailView.vue`)
- 直接从 IndexedDB 加载基本 VOD 数据
- 包含视频播放器和基本信息展示
- 布局相对简单，缺少详细信息展示

## 具体任务分解

### 任务 1: 添加 VOD 详情 API 调用 ✅ 已完成

#### 目标
在 Chrome 扩展中实现类似 Flutter 的 `get_vod_info` API 调用功能。

#### 实施步骤
1. **修改 `xtreamApiService.ts`** ✅
   - 添加 `getVodInfo` 方法接口定义 ✅
   - 实现 HTTP 请求调用 Xtream API ✅
   - 添加错误处理和类型定义 ✅

2. **添加类型定义** ✅
   - 定义 `XtreamVodInfoResponse` 接口 ✅
   - 包含所有可能的视频详情字段 ✅

3. **集成到现有服务** ✅
   - 确保与现有认证和错误处理机制兼容 ✅

#### 验收标准
- 能够成功调用 `get_vod_info` API ✅
- 返回完整的视频详细信息 ✅
- 错误处理完善 ✅

#### 实施详情
- 添加了 `XtreamVodInfoResponse` 接口，包含 `info` 和 `movie_data` 字段
- 实现了 `fetchVodInfo` 方法，使用 `buildXtreamApiUrlWithParams` 构造 URL
- 添加了完整的类型导出
- 创建了单元测试验证功能正确性
- 所有测试通过，构建成功

### 任务 2: 优化数据存储

#### 目标
新建数据库表存储 VOD 视频详情，实现本地缓存功能。

#### 实施步骤
1. **数据库设计**
   - 新建 `xtream_vod_info` 表
   - 字段设计：
     - `id` (主键)
     - `vod_id` (关联 VOD ID)
     - `source_id` (关联源 ID)
     - `info` (JSON 格式存储完整详情)
     - `last_updated` (最后更新时间)
     - `created_at` (创建时间)

2. **修改存储服务**
   - 更新 `XtreamVodStreamsStorageV2` 类
   - 添加 VOD 详情的增删改查方法
   - 实现缓存过期机制

3. **数据同步逻辑**
   - 在获取 VOD 详情时优先检查本地缓存
   - 缓存失效时调用 API 更新数据
   - 支持强制刷新机制

#### 验收标准
- 数据库表结构正确
- 缓存机制工作正常
- 数据同步逻辑可靠

### 任务 3: 优化详情页布局

#### 目标
参考 Flutter 实现，优化 `XtreamVodDetailView.vue` 的布局和展示效果。

#### 实施步骤
1. **布局结构优化**
   - 参考 Flutter 的 SliverAppBar 实现滚动头部效果
   - 添加背景图片展示 (backdrop/poster)
   - 优化响应式设计

2. **详细信息展示**
   - 添加评分、类型、发布日期等元数据显示
   - 展示导演、演员信息
   - 添加剧情简介展示
   - 实现时长等额外信息展示

3. **视觉效果提升**
   - 添加渐变遮罩和阴影效果
   - 优化播放按钮样式和位置
   - 改进加载状态和错误状态展示

4. **数据获取逻辑**
   - 集成新的 VOD 详情 API 调用
   - 实现加载状态管理
   - 添加重试机制

#### 验收标准
- 布局美观，信息展示完整
- 用户体验流畅
- 与现有设计风格保持一致

## 技术考虑

### 兼容性
- 确保与现有 Xtream API 版本兼容
- 考虑不同服务器实现的差异

### 性能优化
- 实现合理的缓存策略
- 避免不必要的 API 调用
- 优化图片加载和显示

### 错误处理
- 网络请求失败的降级处理
- API 返回数据不完整的处理
- 用户友好的错误提示

## 实施优先级

1. **高优先级**: 任务 1 - API 调用实现（基础功能）
2. **中优先级**: 任务 2 - 数据存储优化（性能提升）
3. **中优先级**: 任务 3 - UI 布局优化（用户体验）

## 风险评估

### 技术风险
- Xtream API 接口可能有版本差异
- 数据库迁移可能影响现有数据

### 业务风险
- API 调用失败影响用户体验
- 布局变更可能影响现有用户习惯

## 测试策略

### 单元测试
- API 服务方法测试
- 数据库操作测试
- 组件逻辑测试

### 集成测试
- 端到端数据流测试
- UI 交互测试

### 用户验收测试
- 实际使用场景验证
- 不同设备和浏览器兼容性测试

## 交付物

1. 修改后的源代码文件
2. 数据库迁移脚本
3. 测试用例
4. 用户文档更新

## 时间估算

- 任务 1: 2-3 天
- 任务 2: 2-3 天  
- 任务 3: 3-4 天

总计: 7-10 天（根据具体复杂度调整）</content>
<parameter name="filePath">/Users/jingjiang/Projects/iOS/wizju/wizju_flutter/docs/xtream_vod_detail_optimization_plan.md