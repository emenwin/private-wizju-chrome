import type { M3UMediaItem } from '@/types/stream'
import type { RecentWatchingItem } from '@/types/indexeddb'
import { StorageServiceV2 } from './indexedDb/storageServiceV2'
import { STORE_NAMES } from '@/constants/storage'

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
  private readonly maxItems = 20 // Maximum of 20 recently watched items

  constructor() {
    this.storageService = new StorageServiceV2(STORE_NAMES.RECENT_WATCHING)
  }

  /**
   * Load the recent watching list from IndexedDB
   */
  async loadRecentWatching(): Promise<RecentWatchingItem[]> {
    try {
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
  async addToRecentWatching(data: AddRecentWatchingInput): Promise<RecentWatchingItem[]> {
    const items = await this.loadRecentWatching()

    // Check if the same media item already exists (based on mediaItem.id and sourceId)
    const existingItem = items.find(
      (item) => item.itemId === data.mediaItem.id && item.sourceId === data.sourceId,
    )

    if (existingItem) {
      // If the item already exists, update it
      await this.storageService.updateItem(existingItem.id, {
        dateAdded: existingItem.dateAdded, // Keep original dateAdded
        watchedAt: new Date().toISOString(),
        lastPosition: data.lastPosition,
      })
    } else {
      // If it's a new item, add it
      const newItemData: RecentWatchingCreateData = {
        itemId: data.mediaItem.id,
        sourceId: data.sourceId,
        type: data.mediaItem.type,
        watchedAt: new Date().toISOString(),
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

      // Check if we exceeded the limit
      const updatedItems = await this.loadRecentWatching()
      if (updatedItems.length > this.maxItems) {
        // Remove the oldest item
        const oldestItem = updatedItems[updatedItems.length - 1]
        await this.storageService.removeItem(oldestItem.id)
      }
    }

    return await this.loadRecentWatching()
  }

  /**
   * Remove a specific item from the recent watching list
   */
  async removeFromRecentWatching(itemId: string): Promise<RecentWatchingItem[]> {
    await this.storageService.removeItem(itemId)
    return await this.loadRecentWatching()
  }

  /**
   * Remove all recent watching items related to a specific sourceId
   * Used when deleting a StreamSource
   */
  async removeBySourceId(sourceId: string): Promise<RecentWatchingItem[]> {
    const items = await this.loadRecentWatching()
    const itemsToRemove = items.filter((item) => item.sourceId === sourceId)

    await Promise.all(itemsToRemove.map((item) => this.storageService.removeItem(item.id)))

    return await this.loadRecentWatching()
  }

  /**
   * Update the playback position of a specific item
   */
  async updatePlayPosition(itemId: string, position: number): Promise<RecentWatchingItem[]> {
    const item = await this.storageService.getItemById(itemId)
    if (item) {
      await this.storageService.updateItem(itemId, {
        dateAdded: item.dateAdded, // Keep original dateAdded
        lastPosition: position,
        watchedAt: new Date().toISOString(),
      })
    }
    return await this.loadRecentWatching()
  }

  /**
   * Find a recent watching item by mediaItem ID and source ID
   */
  async findRecentWatchingItem(
    mediaItemId: string,
    sourceId: string,
  ): Promise<RecentWatchingItem | undefined> {
    const items = await this.loadRecentWatching()
    return items.find((item) => item.itemId === mediaItemId && item.sourceId === sourceId)
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
