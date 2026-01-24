import type { M3UMediaItem } from '@/types/stream'
import type { RecentWatchingItem } from '@/types/indexeddb'
import { StorageServiceV2 } from './indexedDb/storageServiceV2'
import { INDEX_NAMES, STORE_NAMES } from '@/constants/storage'

/**
 * Recent Watching Service
 * Handles the management of recently watched media items
 */

/**
 * Input type for creating a recent watching item
 */
export interface AddRecentWatchingInput {
  readonly mediaItem: M3UMediaItem
  readonly sourceId: string
  readonly lastPosition?: number
}

type RecentWatchingCreateData = Omit<RecentWatchingItem, 'id' | 'dateAdded'>

class RecentWatchingService {
  private readonly storageService: StorageServiceV2<RecentWatchingItem, RecentWatchingCreateData>
  private readonly maxItems = 100 // Maximum of 20 recently watched items

  constructor() {
    this.storageService = new StorageServiceV2(STORE_NAMES.RECENT_WATCHING)
  }

  /**
   * Load the recent watching list from IndexedDB
   */
  async loadRecentWatching(options?: {
    offset?: number
    limit?: number
  }): Promise<RecentWatchingItem[]> {
    try {
      const offset = options?.offset ?? 0
      const limit = options?.limit
      if (limit !== undefined) {
        return await this.storageService.getItemsByIndexPaginated(
          INDEX_NAMES.RECENT_WATCHING_BY_WATCHED_AT,
          undefined,
          offset,
          limit,
          'prev',
        )
      }
      const items = await this.storageService.loadItems()
      // Sort by watch time in descending order (newest first)
      return items.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
    } catch (error) {
      console.error('Failed to load recent watching items:', error)
      return []
    }
  }

  /**
   * Add a media item to the recent watching list
   * If the media item already exists, update its watch time and position
   */
  async addToRecentWatching(data: AddRecentWatchingInput): Promise<void> {
    const now = new Date().toISOString()

    // Check if the same media item already exists (based on itemId + sourceId index)
    const matches = await this.storageService.loadItemsByIndex(
      INDEX_NAMES.RECENT_WATCHING_BY_ITEM_AND_SOURCE,
      [data.mediaItem.id, data.sourceId],
    )

    if (matches.length > 0) {
      const [keep, ...duplicates] = matches

      await this.storageService.updateItem(keep.id, {
        dateAdded: keep.dateAdded, // Keep original dateAdded
        watchedAt: now,
        lastPosition: data.lastPosition,
      })

      if (duplicates.length > 0) {
        await this.storageService.removeItems(duplicates.map((item) => item.id))
      }

      return
    }

    // If we are adding a new item, enforce max size up-front by removing oldest entries.
    const count = await this.storageService.countItems()
    if (count >= this.maxItems) {
      const toRemove = count - this.maxItems + 1
      const oldestItems = await this.storageService.getItemsByIndexPaginated(
        INDEX_NAMES.RECENT_WATCHING_BY_WATCHED_AT,
        undefined,
        0,
        toRemove,
        'next',
      )
      if (oldestItems.length > 0) {
        await this.storageService.removeItems(oldestItems.map((item) => item.id))
      }
    }

    const newItemData: RecentWatchingCreateData = {
      itemId: data.mediaItem.id,
      sourceId: data.sourceId,
      type: data.mediaItem.type,
      watchedAt: now,
      lastPosition: data.lastPosition,
      title: data.mediaItem.title,
      description: data.mediaItem.description,
      thumbnail: data.mediaItem.thumbnail,
      category: data.mediaItem.category,
      duration: data.mediaItem.duration,
      tvgName: data.mediaItem.tvgName,
      groupTitle: data.mediaItem.groupTitle,
    }

    await this.storageService.addItem(newItemData)
  }

  /**
   * Remove all recent watching items related to a specific sourceId
   * Used when deleting a StreamSource
   */
  async removeBySourceId(sourceId: string): Promise<void> {
    await this.storageService.removeItemsByIndex(INDEX_NAMES.RECENT_WATCHING_BY_SOURCE_ID, sourceId)
  }

  /**
   * Clear all recent watching records
   */
  async clearAll(): Promise<void> {
    try {
      await this.storageService.clearAll()
    } catch (error) {
      console.error('Failed to clear recent watching items:', error)
    }
  }

  /**
   * Get the storage size estimate
   */
  async getStorageUsage(): Promise<number> {
    try {
      const estimate = await navigator.storage.estimate()
      return estimate.usage || 0
    } catch {
      return 0
    }
  }
}

// Export singleton instance
export const recentWatchingService = new RecentWatchingService()
