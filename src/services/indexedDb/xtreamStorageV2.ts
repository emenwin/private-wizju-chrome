import { StorageServiceV2 } from './storageServiceV2'
import { INDEX_NAMES, STORE_NAMES } from '@/constants/storage'
import { VOD_INFO_CACHE_EXPIRY_HOURS } from '@/constants/storage'
import type {
  XtreamCategory,
  XtreamLiveStream,
  XtreamVodStream,
  XtreamVodInfo,
  XtreamSeries,
  XtreamEpisode,
  CreateXtreamCategory,
  CreateXtreamLiveStream,
  CreateXtreamVodStream,
  CreateXtreamVodInfo,
  CreateXtreamSeries,
  CreateXtreamEpisode,
} from '@/types/xtream'

export class XtreamCategoriesStorageV2 extends StorageServiceV2<
  XtreamCategory,
  CreateXtreamCategory
> {
  constructor() {
    super(STORE_NAMES.XTREAM_CATEGORIES)
  }

  async getCategoriesBySourceAndType(
    sourceId: string,
    type: XtreamCategory['type'],
  ): Promise<XtreamCategory[]> {
    return this.loadItemsByIndex(INDEX_NAMES.XTREAM_CATEGORIES_BY_SOURCE_AND_TYPE, [sourceId, type])
  }

  async clearBySource(sourceId: string): Promise<void> {
    const items = await this.loadItemsByIndex(INDEX_NAMES.XTREAM_CATEGORIES_BY_SOURCE_ID, sourceId)
    await Promise.all(items.map((item) => this.removeItem(item.id)))
  }
}

export class XtreamLiveStreamsStorageV2 extends StorageServiceV2<
  XtreamLiveStream,
  CreateXtreamLiveStream
> {
  constructor() {
    super(STORE_NAMES.XTREAM_LIVE_STREAMS)
  }

  async getBySource(sourceId: string): Promise<XtreamLiveStream[]> {
    return this.loadItemsByIndex(INDEX_NAMES.XTREAM_LIVE_BY_SOURCE_ID, sourceId)
  }

  async getBySourceAndCategory(sourceId: string, categoryId: string): Promise<XtreamLiveStream[]> {
    return this.loadItemsByIndex(INDEX_NAMES.XTREAM_LIVE_BY_SOURCE_AND_CATEGORY_ID, [
      sourceId,
      categoryId,
    ])
  }

  async clearBySource(sourceId: string): Promise<void> {
    const items = await this.loadItemsByIndex(INDEX_NAMES.XTREAM_LIVE_BY_SOURCE_ID, sourceId)
    await Promise.all(items.map((item) => this.removeItem(item.id)))
  }
}

export class XtreamVodStreamsStorageV2 extends StorageServiceV2<
  XtreamVodStream,
  CreateXtreamVodStream
> {
  constructor() {
    super(STORE_NAMES.XTREAM_VOD_STREAMS)
  }

  async getBySource(sourceId: string): Promise<XtreamVodStream[]> {
    return this.loadItemsByIndex(INDEX_NAMES.XTREAM_VOD_BY_SOURCE_ID, sourceId)
  }

  async getBySourceAndCategory(sourceId: string, categoryId: string): Promise<XtreamVodStream[]> {
    return this.loadItemsByIndex(INDEX_NAMES.XTREAM_VOD_BY_SOURCE_AND_CATEGORY_ID, [
      sourceId,
      categoryId,
    ])
  }

  async clearBySource(sourceId: string): Promise<void> {
    const items = await this.loadItemsByIndex(INDEX_NAMES.XTREAM_VOD_BY_SOURCE_ID, sourceId)
    await Promise.all(items.map((item) => this.removeItem(item.id)))
  }
}

export class XtreamVodInfoStorageV2 extends StorageServiceV2<XtreamVodInfo, CreateXtreamVodInfo> {
  constructor() {
    super(STORE_NAMES.XTREAM_VOD_INFO)
  }

  async getBySource(sourceId: string): Promise<XtreamVodInfo[]> {
    return this.loadItemsByIndex(INDEX_NAMES.XTREAM_VOD_INFO_BY_SOURCE_ID, sourceId)
  }

  async getByVodId(vodId: number): Promise<XtreamVodInfo | null> {
    const items = await this.loadItemsByIndex(INDEX_NAMES.XTREAM_VOD_INFO_BY_VOD_ID, vodId)
    return items.length > 0 ? items[0] : null
  }

  async getBySourceAndVodId(sourceId: string, vodId: number): Promise<XtreamVodInfo | null> {
    const items = await this.loadItemsByIndex(INDEX_NAMES.XTREAM_VOD_INFO_BY_SOURCE_AND_VOD_ID, [
      sourceId,
      vodId,
    ])
    return items.length > 0 ? items[0] : null
  }

  async upsertVodInfo(sourceId: string, vodId: number, info: XtreamVodInfo['info']): Promise<void> {
    const existing = await this.getBySourceAndVodId(sourceId, vodId)
    if (existing) {
      await this.updateItem(existing.id, {
        info,
        lastUpdated: new Date().toISOString(),
      })
    } else {
      await this.addItem({
        sourceId,
        vodId,
        info,
        lastUpdated: new Date().toISOString(),
      })
    }
  }

  async clearBySource(sourceId: string): Promise<void> {
    const items = await this.loadItemsByIndex(INDEX_NAMES.XTREAM_VOD_INFO_BY_SOURCE_ID, sourceId)
    await Promise.all(items.map((item) => this.removeItem(item.id)))
  }

  async clearExpired(expiryHours: number = VOD_INFO_CACHE_EXPIRY_HOURS): Promise<void> {
    const expiryTime = new Date(Date.now() - expiryHours * 60 * 60 * 1000).toISOString()
    const allItems = await this.loadItems()
    const expiredItems = allItems.filter((item: XtreamVodInfo) => item.lastUpdated < expiryTime)
    await Promise.all(expiredItems.map((item: XtreamVodInfo) => this.removeItem(item.id)))
  }
}

export class XtreamSeriesStorageV2 extends StorageServiceV2<XtreamSeries, CreateXtreamSeries> {
  constructor() {
    super(STORE_NAMES.XTREAM_SERIES)
  }

  async getBySource(sourceId: string): Promise<XtreamSeries[]> {
    return this.loadItemsByIndex(INDEX_NAMES.XTREAM_SERIES_BY_SOURCE_ID, sourceId)
  }

  async getBySourceAndCategory(sourceId: string, categoryId: string): Promise<XtreamSeries[]> {
    return this.loadItemsByIndex(INDEX_NAMES.XTREAM_SERIES_BY_SOURCE_AND_CATEGORY_ID, [
      sourceId,
      categoryId,
    ])
  }

  async clearBySource(sourceId: string): Promise<void> {
    const items = await this.loadItemsByIndex(INDEX_NAMES.XTREAM_SERIES_BY_SOURCE_ID, sourceId)
    await Promise.all(items.map((item) => this.removeItem(item.id)))
  }
}

export class XtreamEpisodesStorageV2 extends StorageServiceV2<XtreamEpisode, CreateXtreamEpisode> {
  constructor() {
    super(STORE_NAMES.XTREAM_EPISODES)
  }

  async getBySeries(seriesId: string): Promise<XtreamEpisode[]> {
    return this.loadItemsByIndex(INDEX_NAMES.XTREAM_EPISODES_BY_SERIES_ID, seriesId)
  }

  async clearBySeries(seriesId: string): Promise<void> {
    const items = await this.getBySeries(seriesId)
    await Promise.all(items.map((item) => this.removeItem(item.id)))
  }
}
