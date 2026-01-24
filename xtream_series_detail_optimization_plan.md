# Xtream Series 详情展示流程优化任务规划

## 项目概述
优化 Chrome 扩展中 Xtream Series 的详情展示流程，提升用户体验和性能。主要包括数据获取策略优化、数据库存储扩展以及UI布局改进。

## 相关文件
- `XtreamSeriesDetailView.vue` - Series详情页面组件
- `xtreamApiService.ts` - Xtream API服务
- `xtreamStorageV2.ts` - IndexedDB存储服务
- `xtream_repository_impl.dart` - Flutter数据仓库实现参考
- `xtream_api_client.dart` - Flutter API客户端参考
- `series_detail_page.dart` - Flutter Series详情页面布局参考

## 任务分解

### 任务1: 优化Series详情数据获取策略
**目标**: 参考Flutter中获取Series详情的方式，实现本地缓存优先的策略

**当前问题**:
- Chrome扩展每次进入详情页都调用API获取数据
- 没有本地缓存，导致重复网络请求和加载延迟

**参考Flutter实现**:
```dart
// Flutter中的getSeriesInfo实现
Future<XtreamSeriesInfoDO> getSeriesInfo(int sourceId, String seriesId) async {
  // 直接调用API，没有本地缓存
  final data = await _apiClient.getSeriesInfo(int.parse(seriesId));
  return XtreamSeriesInfoDO.fromJson(data);
}
```

**优化方案**:
1. 检查本地数据库是否已有该Series的详情数据
2. 如果存在且未过期，使用本地数据
3. 如果不存在或已过期，调用API获取并缓存到本地
4. 实现缓存过期机制（类似VOD info的实现）

**涉及文件修改**:
- `xtreamStorageV2.ts` - 新增XtreamSeriesInfo存储类
- `XtreamSeriesDetailView.vue` - 修改数据加载逻辑
- `xtreamApiService.ts` - 可选：添加缓存相关方法

### 任务2: 数据库存储扩展
**目标**: 新建数据库表保存Series详情数据，实现持久化缓存

**当前数据库结构分析**:
- 已有的表：XtreamSeries（基本信息）、XtreamEpisodes（剧集列表）
- 缺失的表：XtreamSeriesInfo（详情信息，包括seasons和episodes结构化数据）

**新表设计**:
```typescript
interface XtreamSeriesInfo {
  id: string
  sourceId: string
  seriesId: string
  info: {
    name?: string
    plot?: string
    cast?: string
    director?: string
    genre?: string
    releaseDate?: string
    rating?: string
    backdrop?: string
    youtubeTrailer?: string
    episodeRunTime?: number
  }
  seasons: Array<{
    seasonNumber: number
    name?: string
    cover?: string
    overview?: string
    airDate?: string
    episodeCount?: number
  }>
  episodes: Record<string, Array<{
    id: number
    episodeNum?: number
    title?: string
    containerExtension?: string
    info?: string
    directSource?: string
  }>>
  lastUpdated: string
  expiresAt: string
}
```

**实现步骤**:
1. 在`xtreamStorageV2.ts`中添加`XtreamSeriesInfoStorageV2`类
2. 在存储常量中添加新的store名称和索引
3. 实现CRUD操作方法
4. 添加缓存过期清理逻辑

**涉及文件修改**:
- `constants/storage.ts` - 添加新的store名称和索引常量
- `types/xtream.ts` - 添加XtreamSeriesInfo相关类型定义
- `xtreamStorageV2.ts` - 新增存储类实现

### 任务3: UI布局优化
**目标**: 参考Flutter Series详情页布局，优化Chrome扩展的展示效果

**Flutter布局分析**:
```dart
// Flutter SeriesDetailPage结构
- SliverAppBar (背景图 + 标题)
- 剧集信息卡片 (海报、简介、评分等)
- 季选择器
- 集列表 (可滚动)
- 播放控制
```

**Chrome扩展当前布局问题**:
- 背景图显示不够突出
- 信息布局可以更紧凑
- 季和集的选择交互可以优化
- 缺少一些视觉效果（如渐变遮罩、阴影等）

**优化方案**:
1. 改进背景图的显示效果（参考Flutter的SliverAppBar）
2. 重新组织信息卡片的布局
3. 优化季和集的选择器UI
4. 添加更多的视觉效果和动画
5. 改进响应式设计

**涉及文件修改**:
- `XtreamSeriesDetailView.vue` - 主要布局和样式修改

## 实施计划

### Phase 1: 数据层优化 (任务1 + 任务2)
1. 设计并实现XtreamSeriesInfo存储表
2. 修改数据获取逻辑，实现缓存优先策略
3. 添加缓存过期和清理机制
4. 测试数据持久化和缓存效果

### Phase 2: UI层优化 (任务3)
1. 分析Flutter布局的优秀之处
2. 重新设计Chrome扩展的布局结构
3. 实现新的视觉效果和交互
4. 优化响应式设计和用户体验

### Phase 3: 集成测试和优化
1. 端到端测试所有功能
2. 性能测试和优化
3. 错误处理和边界情况处理
4. 代码审查和文档更新

## 验收标准
- [ ] Series详情数据能够正确缓存到本地数据库
- [ ] 重复访问详情页时优先使用缓存数据
- [ ] 缓存数据有过期机制，过期后自动刷新
- [ ] UI布局更加美观，参考Flutter的设计
- [ ] 用户体验流畅，无明显加载延迟
- [ ] 错误处理完善，网络异常时有合适反馈

## 风险评估
- **技术风险**: IndexedDB存储复杂数据结构可能遇到兼容性问题
- **性能风险**: 大量数据缓存可能影响浏览器性能
- **UI风险**: 布局调整可能影响现有功能

## 依赖关系
- 需要先完成数据层优化，再进行UI优化
- Flutter代码作为参考，但需适配Chrome扩展的技术栈
- 需要确保向后兼容，不影响现有功能</content>
<parameter name="filePath">/private-wizju-chrome/xtream_series_detail_optimization_plan.md