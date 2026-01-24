import { XtreamVodInfoStorageV2 } from '@/services/indexedDb/xtreamStorageV2'
import { StreamSourcesStorageV2 } from '@/services/indexedDb/streamSourcesStorageV2'
import { xtreamApiService, type XtreamVodInfoResponse } from './xtreamApiService'
import { VOD_INFO_CACHE_EXPIRY_HOURS } from '@/constants/storage'

/**
 * Xtream VOD Info Service
 *
 * Handles VOD info caching and retrieval with automatic cache management
 */
export class XtreamVodInfoService {
  private storage: XtreamVodInfoStorageV2
  private sourceStorage: StreamSourcesStorageV2
  private apiService: typeof xtreamApiService

  constructor() {
    this.storage = new XtreamVodInfoStorageV2()
    this.sourceStorage = new StreamSourcesStorageV2()
    this.apiService = xtreamApiService
  }

  /**
   * Get VOD info with caching
   * @param sourceId Source ID
   * @param vodId VOD ID
   * @param forceRefresh Force refresh from API
   * @returns VOD info response
   */
  async getVodInfo(
    sourceId: string,
    vodId: number,
    forceRefresh: boolean = false,
  ): Promise<XtreamVodInfoResponse> {
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = await this.storage.getBySourceAndVodId(sourceId, vodId)
      if (cached) {
        const cacheAge = Date.now() - new Date(cached.lastUpdated).getTime()
        const cacheExpiryMs = VOD_INFO_CACHE_EXPIRY_HOURS * 60 * 60 * 1000

        if (cacheAge < cacheExpiryMs) {
          return cached.info
        }
      }
    }

    // Get source credentials
    const source = await this.sourceStorage.getItemById(sourceId)
    if (!source || !source.username || !source.password) {
      throw new Error(`Source ${sourceId} not found or missing credentials`)
    }

    // Fetch from API
    const info = await this.apiService.fetchVodInfo(
      source.url,
      source.username,
      source.password,
      vodId,
    )

    // Cache the result
    await this.storage.upsertVodInfo(sourceId, vodId, info)

    return info
  }

  /**
   * Clear cache for a specific source
   * @param sourceId Source ID
   */
  async clearCacheBySource(sourceId: string): Promise<void> {
    await this.storage.clearBySource(sourceId)
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    await this.storage.clearExpired(VOD_INFO_CACHE_EXPIRY_HOURS)
  }

  /**
   * Preload VOD info for multiple VODs
   * @param sourceId Source ID
   * @param vodIds Array of VOD IDs
   */
  async preloadVodInfo(sourceId: string, vodIds: number[]): Promise<void> {
    const promises = vodIds.map((vodId) => this.getVodInfo(sourceId, vodId, false))
    await Promise.allSettled(promises)
  }
}
